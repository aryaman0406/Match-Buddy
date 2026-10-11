import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateExplainInput } from "@/lib/validation";
import { globalRateLimiter } from "@/lib/rateLimit";
import { globalResponseCache, generateCacheKey } from "@/lib/cache";
import { buildSystemPrompt } from "@/prompts/system";
import { buildPlayerPrompt } from "@/prompts/player";
import { buildEventPrompt } from "@/prompts/event";
import { buildQuestionPrompt } from "@/prompts/question";
import { buildStoryPrompt } from "@/prompts/story";

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

  // 3. Check in-memory response cache (30-minute TTL)
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
        "X-Cache-Lookup": "HIT",
      },
    });
  }

  // 4. Construct prompts from /prompts
  const systemInstruction = buildSystemPrompt(language, persona);
  let userPrompt = "";

  if (kind === "player") {
    userPrompt = buildPlayerPrompt({
      name: playerData?.name || id || "Key Player",
      role: playerData?.role || "Player",
      team: playerData?.team || sport,
      onField: playerData?.onField || "Active on pitch",
      keyFacts: playerData?.keyFacts || [],
      sport,
      matchContext,
    });
  } else if (kind === "event") {
    userPrompt = buildEventPrompt({
      title: eventData?.title || "Match Event",
      term: eventData?.term || "Tactical rule",
      timeOrOver: eventData?.over || "Live",
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
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  if (!apiKey) {
    // Return friendly 503 so client shows saved fallback gracefully
    return NextResponse.json(
      {
        error: "AI service is currently in offline mode (GEMINI_API_KEY not configured).",
        code: "NO_API_KEY",
      },
      { status: 503 }
    );
  }

  // 6. Call Google Gemini Streaming API
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
    });

    const result = await model.generateContentStream(userPrompt);

    const encoder = new TextEncoder();
    let accumulatedText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
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
        "X-Cache-Lookup": "MISS",
      },
    });
  } catch (error) {
    const safeError = (error instanceof Error ? error.message : String(error)).replace(/AIza[0-9A-Za-z-_]{35}/g, "AIza***");
    console.warn("Gemini API call failed:", safeError);

    const isQuotaOrRateLimit =
      safeError.includes("429") ||
      safeError.toLowerCase().includes("quota") ||
      safeError.toLowerCase().includes("resource_exhausted");

    if (isQuotaOrRateLimit) {
      return NextResponse.json(
        {
          error: "AI service rate limit reached. Showing saved fallback.",
          code: "UPSTREAM_RATE_LIMIT",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "15",
          },
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate AI response from upstream model.",
        code: "UPSTREAM_ERROR",
      },
      { status: 502 }
    );
  }
}
