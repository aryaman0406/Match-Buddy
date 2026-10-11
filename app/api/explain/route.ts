import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateExplainInput } from "@/lib/validation";
import { globalRateLimiter } from "@/lib/rateLimit";
import { globalResponseCache, generateCacheKey } from "@/lib/cache";
import { buildSystemPrompt } from "@/prompts/system";
import { buildQuestionPrompt } from "@/prompts/question";
import { buildStoryPrompt } from "@/prompts/story";
import { buildPlayerPrompt } from "@/prompts/player";
import { buildEventPrompt } from "@/prompts/event";

import { cricketMatch } from "@/data/sports/cricket";
import { footballMatch } from "@/data/sports/football";
import { basketballMatch } from "@/data/sports/basketball";

// Helper to simulate a streamed text response for cached or fallback responses
function createSimulatedStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  let wordIndex = 0;

  return new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          const chunk = (wordIndex === 0 ? "" : " ") + words[wordIndex];
          controller.enqueue(encoder.encode(chunk));
          wordIndex++;
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 25);
    },
  });
}

// Allow up to 15s for streaming responses on Vercel Serverless Functions
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  // 1. IP extraction and Rate Limit check (20 requests per IP per 10 minutes)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateLimitStatus = globalRateLimiter.check(ip);
  if (!rateLimitStatus.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit reached. Maximum 20 requests per 10 minutes allowed.",
        retryAfterMs: Math.max(0, rateLimitStatus.resetTime - Date.now()),
      },
      {
        status: 429,
        headers: {
          "Retry-After": "600",
        },
      }
    );
  }

  // 2. Parse and validate JSON input
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON format in request body." },
      { status: 400 }
    );
  }

  const validation = validateExplainInput(rawBody as Parameters<typeof validateExplainInput>[0]);
  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { kind, id, text, language, persona, sport, matchContext, playerData, eventData } =
    validation.data;

  // Helper to retrieve verified, grounded fallback text if AI is unreachable or offline
  const getSavedFallback = (): string => {
    if (kind === "player") {
      const allPlayers = [...cricketMatch.players, ...footballMatch.players, ...basketballMatch.players];
      const matchPlayer = allPlayers.find((p) => p.id === id);
      return (
        matchPlayer?.fallbackIntro?.[language] ||
        playerData?.fallbackIntro?.[language] ||
        (language === "hinglish"
          ? `${playerData?.name || "Player"} match me critical role play kar rahe hain.`
          : `${playerData?.name || "Player"} is playing a key role in this clash.`)
      );
    }
    if (kind === "event") {
      const allEvents = [...cricketMatch.events, ...footballMatch.events, ...basketballMatch.events];
      const matchEvent = allEvents.find((e) => e.id === id);
      return (
        matchEvent?.fallbackExplain?.[language] ||
        eventData?.fallbackExplain?.[language] ||
        (language === "hinglish"
          ? `${eventData?.title || "Match event"} is match ka key moment hai.`
          : `${eventData?.title || "Match event"} is a key match moment.`)
      );
    }
    if (kind === "story") {
      const allMatches = [cricketMatch, footballMatch, basketballMatch];
      const m = allMatches.find((cm) => cm.sportName.toLowerCase() === sport.toLowerCase()) || cricketMatch;
      return m.storyFallback[language];
    }
    // question
    const allMatches = [cricketMatch, footballMatch, basketballMatch];
    const cleanQ = (text || "").toLowerCase();
    for (const matchItem of allMatches) {
      for (const [key, val] of Object.entries(matchItem.rulesDictionary)) {
        if (cleanQ.includes(key)) {
          return val[language];
        }
      }
    }
    return language === "hinglish"
      ? "Abhi hum AI companion se connect nahi kar paaye. Kripya thodi der baad dobara koshish karein ya suggest kiye hue rules par tap karein!"
      : "We couldn't reach the AI companion right now. Please try again in a moment or tap one of the suggested rules below!";
  };

  // 3. Check in-memory response cache (30-minute TTL) across all kinds
  const idOrText = id || text || kind;
  const cacheKey = generateCacheKey({
    kind,
    idOrText,
    language,
    persona,
    sport,
  });

  const cachedResponse = globalResponseCache.get(cacheKey);
  if (cachedResponse) {
    return new Response(createSimulatedStream(cachedResponse), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Review-Label": "Live AI",
        "X-Cache-Lookup": "HIT",
      },
    });
  }

  // 4. Construct prompts from /prompts for all request kinds
  const systemInstruction = buildSystemPrompt(language, persona);
  let userPrompt = "";

  if (kind === "player") {
    const allPlayers = [...cricketMatch.players, ...footballMatch.players, ...basketballMatch.players];
    const matchPlayer = allPlayers.find((p) => p.id === id);
    const pName = playerData?.name || matchPlayer?.name || "Player";
    const pRole = playerData?.role || matchPlayer?.role || "Player";
    const pTeam = playerData?.team || matchPlayer?.country || "Team";
    const pOnField = playerData?.onField || matchPlayer?.onField || "Active";
    const pKeyFacts =
      playerData?.keyFacts && playerData.keyFacts.length > 0
        ? playerData.keyFacts
        : (matchPlayer?.keyFacts || []);

    userPrompt = buildPlayerPrompt({
      name: pName,
      role: pRole,
      team: pTeam,
      onField: pOnField,
      keyFacts: pKeyFacts,
      sport,
      matchContext,
    });
  } else if (kind === "event") {
    const allEvents = [...cricketMatch.events, ...footballMatch.events, ...basketballMatch.events];
    const matchEvent = allEvents.find((e) => e.id === id);
    const eTitle = eventData?.title || matchEvent?.title || "Match Event";
    const eTerm = eventData?.term || matchEvent?.term || "Rule";
    const eOver = eventData?.over || matchEvent?.over || "Live";

    userPrompt = buildEventPrompt({
      title: eTitle,
      term: eTerm,
      timeOrOver: eOver,
      sport,
      matchContext,
    });
  } else if (kind === "story") {
    userPrompt = buildStoryPrompt({
      sport,
      matchContext: matchContext || `${sport} live match in progress.`,
    });
  } else {
    // kind === "question"
    userPrompt = buildQuestionPrompt({
      question: text || "",
      sport,
      matchContext,
    });
  }

  // 5. Read API key and Model strictly from server environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  if (!apiKey) {
    // Return saved fallback stream with X-Source: fallback
    return new Response(createSimulatedStream(getSavedFallback()), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Source": "fallback",
      },
    });
  }

  // Candidate models chain for maximum reliability and quota resilience
  const candidateModels = [
    primaryModel,
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  // 6. Call Google Gemini Streaming API with candidate model fallback
  const genAI = new GoogleGenerativeAI(apiKey);
  let streamResult = null;

  for (const modelCandidate of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelCandidate,
        systemInstruction,
      });

      streamResult = await model.generateContentStream(userPrompt);
      break;
    } catch (modelErr) {
      const safeError = (modelErr instanceof Error ? modelErr.message : String(modelErr)).replace(
        /AIza[0-9A-Za-z-_]{35}/g,
        "AIza***"
      );
      console.warn(`Model candidate ${modelCandidate} failed:`, safeError);
    }
  }

  if (!streamResult) {
    return new Response(createSimulatedStream(getSavedFallback()), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Source": "fallback",
      },
    });
  }

  try {
    const encoder = new TextEncoder();
    let accumulatedText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              accumulatedText += chunkText;
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          // Cache the completed response
          if (accumulatedText.trim()) {
            globalResponseCache.set(cacheKey, accumulatedText.trim());
          }
          controller.close();
        } catch (streamErr) {
          controller.error(streamErr);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Review-Label": "Live AI",
        "X-Cache-Lookup": "MISS",
      },
    });
  } catch (error) {
    const safeError = (error instanceof Error ? error.message : String(error)).replace(
      /AIza[0-9A-Za-z-_]{35}/g,
      "AIza***"
    );
    console.warn("Gemini streaming failed:", safeError);

    return new Response(createSimulatedStream(getSavedFallback()), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Source": "fallback",
      },
    });
  }
}
