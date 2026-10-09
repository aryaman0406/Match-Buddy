import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { match, players, initialEvents, storyFallback, rulesDictionary } from "@/data/match";

// In-memory rate limiting: 20 requests per IP per 10 minutes (Prompt 5 requirement)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

// Helper to simulate a streamed text response if API key is not present or offline
function createSimulatedStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  let wordIndex = 0;

  return new ReadableStream({
    async start(controller) {
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          const chunk = (wordIndex === 0 ? "" : " ") + words[wordIndex];
          controller.enqueue(encoder.encode(chunk));
          wordIndex++;
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 35); // smooth 35ms per word streaming
    },
  });
}

// Sports relevance validation
function isSportsRelated(query: string): boolean {
  const lower = query.toLowerCase().trim();
  const sportsKeywords = [
    "cricket", "match", "ball", "bat", "over", "wicket", "run", "dls", "lbw",
    "free hit", "no ball", "wide", "six", "four", "boundary", "stump", "crease",
    "super over", "powerplay", "impact player", "review", "drs", "umpire",
    "pitch", "spin", "pace", "seam", "swing", "catch", "bowled", "india",
    "australia", "cummins", "starc", "hardik", "surya", "sky", "strike", "rrr",
    "offside", "legside", "maiden", "hat-trick", "bouncers", "yorker", "duck",
    "football", "goal", "offside", "penalty", "card"
  ];

  // If very short query or matches sports keyword
  return sportsKeywords.some((keyword) => lower.includes(keyword));
}

export async function POST(req: NextRequest) {
  // 1. IP extraction and Rate Limit check
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Maximum 20 requests per 10 minutes allowed.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body provided." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { kind, id, text, language = "en", matchState } = body || {};

    // 2. Validate input (Prompt 5 requirement: return 400 on bad input)
    if (!kind || !["player", "event", "question", "story"].includes(kind)) {
      return new Response(
        JSON.stringify({ error: "Invalid kind. Must be 'player', 'event', 'question', or 'story'." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!language || !["en", "hinglish"].includes(language)) {
      return new Response(
        JSON.stringify({ error: "Invalid language. Must be 'en' or 'hinglish'." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (text && typeof text === "string" && text.length > 200) {
      return new Response(
        JSON.stringify({ error: "Text exceeds maximum allowed length of 200 characters." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use current match state if provided by client, otherwise default mock
    const currentMatch = matchState || match;
    const matchContext = `Match: ${currentMatch.teams.join(" vs ")}, ${currentMatch.series}. Current Score: ${currentMatch.score} in ${currentMatch.overs} overs. Target: ${currentMatch.target}. Runs needed: ${currentMatch.runsNeeded} from ${currentMatch.ballsLeft} balls. Required Run Rate: ${currentMatch.requiredRunRate}.`;

    // Non-sports question check (Prompt 5 requirement)
    if (kind === "question" && text) {
      const lowerText = text.toLowerCase();
      // Obvious non-sports questions (e.g., "write my homework", "what is the capital of France")
      const nonSportsPatterns = ["homework", "essay", "weather", "recipe", "code in python", "capital of", "president", "math problem"];
      const isClearlyNonSport = nonSportsPatterns.some((pattern) => lowerText.includes(pattern));

      if (isClearlyNonSport || (!isSportsRelated(text) && !text.includes("?"))) {
        const refusal =
          language === "hinglish"
            ? "Main sirf cricket aur sports ke sawaal explain karta hoon! Cricket ke kisi rule ya iss match ke baare me kuch bhi puchiye."
            : "I can only help explain cricket and sports rules! Feel free to ask about any cricket rule or this match situation.";
        return new Response(createSimulatedStream(refusal), {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }

    // 3. Build prompts tailored to kind and context
    let systemPrompt = "";
    let userPrompt = "";
    let fallbackText = "";

    const langRule =
      language === "hinglish"
        ? "simple Hindi written in Roman script (Hinglish), conversational like a cricket-loving Indian friend watching the match together."
        : "simple, friendly, jargon-free English for a casual fan.";

    if (kind === "player") {
      const player = players.find((p) => p.id === id) || players[0];
      fallbackText = player.fallbackIntro[language as "en" | "hinglish"];

      systemPrompt = `You are Match Buddy, a friendly cricket companion for casual fans. Reply in ${langRule}
For players: write 3 short sentences (max 60 words): who they are, one highlight using ONLY the keyFacts provided below, and why they matter at this exact moment of the match. Never invent statistics. No headings or bullet points.`;

      userPrompt = `Current match situation: ${matchContext}
Player name: ${player.name}
Role: ${player.role}
Current figures: ${player.onField}
Verified facts:
${player.keyFacts.join("\n")}`;
    } else if (kind === "event") {
      const event = initialEvents.find((e) => e.id === id) || initialEvents[0];
      fallbackText = event.fallbackExplain[language as "en" | "hinglish"];

      systemPrompt = `You are Match Buddy, a friendly cricket companion for casual fans. Reply in ${langRule}
For events: write exactly 2 short sentences: what it means, and what it means for the match right now. Never invent statistics. No headings or bullet points.`;

      userPrompt = `Current match situation: ${matchContext}
Event title: ${event.title}
Rule/Term: ${event.term}
Over: ${event.over}`;
    } else if (kind === "story") {
      fallbackText = storyFallback[language as "en" | "hinglish"];

      systemPrompt = `You are Match Buddy, a friendly cricket companion for casual fans. Reply in ${langRule}
Write a 30-second story of the innings so far in 4 short sentences: how it started, the turning points, the current situation and what India need now. No headings or bullet points.`;

      userPrompt = `Current match situation: ${matchContext}
Key moments: Rohit Sharma out early (3.2 ov), Tilak Varma caught & bowled by Pat Cummins (11.2 ov), Hardik Pandya (41*) & Suryakumar Yadav (22*) counter-attacking. Target is 166.`;
    } else {
      // kind === "question"
      const cleanText = text?.trim().toLowerCase() || "";

      // Check quick dictionary first for instant high-quality explanation fallback
      for (const [key, val] of Object.entries(rulesDictionary)) {
        if (cleanText.includes(key)) {
          fallbackText = val[language as "en" | "hinglish"];
          break;
        }
      }

      if (!fallbackText) {
        fallbackText =
          language === "hinglish"
            ? `Yeh cricket ka rule batata hai ki fielders aur batters ko match ke dauraan kaise khelna hai. Iss match me runs chase karne ke liye yeh rule bohot zaroori role play kar raha hai.`
            : `This rule governs the fair play and field positioning during live play. In this current match context, understanding it helps you see why the fielding team is adjusting their plans.`;
      }

      systemPrompt = `You are Match Buddy, a friendly cricket companion for casual fans. Reply in ${langRule}
For questions: write exactly 2 short sentences: what it means, and what it means for the match right now. Never invent statistics. If the question is not about sports, politely say you only help with sports. No headings or bullet points.`;

      userPrompt = `Current match situation: ${matchContext}
User question: "${text}"`;
    }

    // 4. Call Anthropic Claude API if API key is present
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";

    if (apiKey) {
      try {
        const anthropic = new Anthropic({ apiKey });

        const stream = await anthropic.messages.create({
          model,
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          stream: true,
        });

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of stream) {
                if (
                  chunk.type === "content_block_delta" &&
                  chunk.delta.type === "text_delta"
                ) {
                  controller.enqueue(encoder.encode(chunk.delta.text));
                }
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(readableStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } catch (anthropicErr) {
        console.warn("Anthropic API call failed, falling back to grounded response:", anthropicErr);
        // Fallback to grounded verified explanation
        return new Response(createSimulatedStream(fallbackText), {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }

    // 5. If no API key is provided, return grounded verified streaming fallback
    return new Response(createSimulatedStream(fallbackText), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
