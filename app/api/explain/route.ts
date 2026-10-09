import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { match, players, initialEvents, storyFallback, rulesDictionary } from "@/data/match";
import { allSportsMatches } from "@/data/sportsData";

// In-memory rate limiting: 30 requests per IP per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

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

// Helper to simulate a streamed text response when API key is missing or offline
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
      }, 30);
    },
  });
}

// Global sports relevance check — inclusive of all sports, games, and teams worldwide
function isSportsRelated(query: string): boolean {
  const lower = query.toLowerCase().trim();

  // Explicit non-sports topics that must be rejected
  const nonSportsStrict = [
    "write code", "python", "javascript", "react code", "html", "css",
    "homework", "essay on", "recipe for", "bake a cake", "capital of",
    "math problem", "solve x", "stock market", "crypto trading",
    "who is president of", "prime minister of", "write a poem about",
  ];
  if (nonSportsStrict.some((term) => lower.includes(term))) {
    return false;
  }

  const sportsKeywords = [
    // Cricket
    "cricket", "match", "ball", "bat", "over", "wicket", "run", "dls", "lbw",
    "free hit", "no ball", "wide", "six", "four", "boundary", "stump", "crease",
    "super over", "powerplay", "impact player", "review", "drs", "umpire", "pitch",
    "spin", "pace", "seam", "swing", "catch", "bowled", "strike", "rrr", "maiden",
    "hat-trick", "bouncer", "yorker", "duck", "ipl", "t20", "odi", "test", "csk",
    "mi", "rcb", "kkr", "bcci", "kohli", "rohit", "dhoni",
    // Football / Soccer
    "football", "soccer", "goal", "offside", "penalty", "card", "red card",
    "yellow card", "corner", "free kick", "var", "substitution", "extra time",
    "stoppage", "header", "dribble", "tackle", "keeper", "goalkeeper", "striker",
    "midfielder", "defender", "premier league", "la liga", "champions league",
    "world cup", "fifa", "messi", "ronaldo", "real madrid", "barcelona", "arsenal",
    "manchester", "bayern", "psg", "liverpool", "bellingham", "vinicius", "haaland",
    // Basketball
    "basketball", "nba", "dunk", "three pointer", "free throw", "rebound", "assist",
    "turnover", "foul", "technical foul", "flagrant", "travel", "double dribble",
    "shot clock", "quarter", "overtime", "layup", "alley oop", "lakers", "warriors",
    "celtics", "lebron", "curry", "jordan", "kobe", "giannis", "doncic",
    // Tennis
    "tennis", "serve", "ace", "deuce", "break point", "match point", "set point",
    "volley", "forehand", "backhand", "grand slam", "tiebreak", "love", "wimbledon",
    "us open", "roland garros", "atp", "wta", "djokovic", "alcaraz", "federer", "nadal", "sinner",
    // F1 / Motorsport
    "formula", "f1", "pit stop", "pole position", "lap", "qualifying", "drs",
    "safety car", "undercut", "verstappen", "hamilton", "leclerc", "norris", "ferrari", "red bull",
    // Kabaddi
    "kabaddi", "raid", "raider", "tackle point", "super raid", "super tackle",
    "pro kabaddi", "pkl", "all-out", "bonus point",
    // Badminton & Table Tennis
    "badminton", "shuttle", "smash", "rally", "drop shot", "table tennis", "ping pong",
    // Hockey & Baseball
    "hockey", "puck", "slap shot", "nhl", "baseball", "home run", "pitcher", "strikeout", "mlb",
    // Rugby, NFL, American Football
    "rugby", "nfl", "touchdown", "quarterback", "super bowl", "field goal",
    // Combat sports
    "boxing", "mma", "ufc", "knockout", "ko", "round", "wrestling", "olympics",
    // General terms
    "player", "team", "score", "coach", "captain", "referee", "league",
    "tournament", "championship", "season", "halftime", "injury", "sport", "game",
    "win", "loss", "draw", "tie", "final", "mvp", "athlete", "cup", "trophy",
  ];

  return sportsKeywords.some((keyword) => lower.includes(keyword)) || query.includes("?");
}

export async function POST(req: NextRequest) {
  // 1. IP extraction and Rate Limit check
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body provided." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Support client-supplied Gemini API key or environment variable
  const clientApiKey =
    (req.headers.get("x-gemini-key") || (body.geminiApiKey as string) || "").trim();
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY || "";
  const modelName =
    (req.headers.get("x-gemini-model") || (body.geminiModel as string) || process.env.GEMINI_MODEL || "gemini-2.0-flash").trim();

  // Apply rate limit only when using shared server key (custom keys have their own quota)
  if (!clientApiKey && !checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({
        error: "Rate limit reached (30 requests/10m). Enter your own Gemini API key for unlimited access!",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const {
      kind,
      id,
      text,
      language = "en",
      matchState,
      sport,
      playerData,
      eventData,
    } = body || {};

    if (!kind || !["player", "event", "question", "story"].includes(kind as string)) {
      return new Response(
        JSON.stringify({ error: "Invalid kind. Must be 'player', 'event', 'question', or 'story'." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!language || !["en", "hinglish"].includes(language as string)) {
      return new Response(
        JSON.stringify({ error: "Invalid language. Must be 'en' or 'hinglish'." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (text && typeof text === "string" && text.length > 300) {
      return new Response(
        JSON.stringify({ error: "Text exceeds maximum allowed length of 300 characters." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build sports context
    const currentSport = (sport as string) || "Cricket";
    const currentMatchDesc =
      typeof matchState === "string"
        ? matchState
        : matchState && typeof matchState === "object"
        ? JSON.stringify(matchState)
        : `Live Match in progress`;

    // Strict non-sports question guardrail
    if (kind === "question" && text) {
      const qText = text as string;
      if (!isSportsRelated(qText)) {
        const refusal =
          language === "hinglish"
            ? "Main sirf sports ke sawaal explain karta hoon! Cricket, football, basketball, tennis, F1 ya kisi bhi sport, team ya player ke baare me kuch bhi puchiye."
            : "I am your sports companion! Ask me about any sport — cricket, football, basketball, tennis, F1, kabaddi, or any team and player around the world.";
        return new Response(createSimulatedStream(refusal), {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }

    let userPrompt = "";
    let fallbackText = "";

    const langRule =
      language === "hinglish"
        ? "conversational Hindi written in Roman script (Hinglish), like a passionate sports-loving Indian buddy explaining the play at a live watch party."
        : "simple, punchy, jargon-free English for a casual fan.";

    const persona = (body.persona as string) || "casual";
    let personaInstruction = "Warm, approachable, friendly, and jargon-free for a casual spectator.";
    if (persona === "analyst") {
      personaInstruction = "Tactical, astute, data-informed, explaining strategic decisions and win probability shifts like an elite analyst.";
    } else if (persona === "desi") {
      personaInstruction = "Full desi watch party vibe, lively conversational banter, hyped up like your best friend on the living room sofa.";
    }

    const systemInstruction = `You are Match Buddy, a passionate, knowledgeable, and friendly AI sports companion for fans watching ANY live sport (Cricket, Football/Soccer, Basketball, Tennis, Formula 1, Kabaddi, Baseball, Hockey, Badminton, NFL, UFC, etc.) and ANY team across the globe.
You explain players, rules, strategic moments, and game narratives in a fun, conversational way so fans never feel lost.
Persona tone: ${personaInstruction}
Always respond in ${langRule}
Keep your answer concise: 2 to 3 punchy sentences (maximum 60 words).
Never use markdown headings or bullet points. Just natural, engaging conversational text.`;

    if (kind === "player") {
      const p = (playerData as {
        name?: string;
        role?: string;
        onField?: string;
        country?: string;
        team?: string;
        keyFacts?: string[];
        fallbackIntro?: { en: string; hinglish: string };
      }) || {};

      // Search across all sports config if player was selected by ID
      let matchedPlayer = p.name ? p : null;
      if (!matchedPlayer && id) {
        for (const sportConfig of allSportsMatches) {
          const found = sportConfig.players.find((pl) => pl.id === id);
          if (found) {
            matchedPlayer = found;
            break;
          }
        }
      }

      const pName = matchedPlayer?.name || "Star Player";
      const pRole = matchedPlayer?.role || "Key Player";
      const pStats = matchedPlayer?.onField || "Active";
      const pTeam = matchedPlayer?.country || p.team || "Team";
      const pFacts = matchedPlayer?.keyFacts?.join("; ") || "Top performer";

      fallbackText =
        matchedPlayer?.fallbackIntro?.[(language as "en" | "hinglish")] ||
        (language === "hinglish"
          ? `${pName} ${pTeam} ke key ${pRole} hain. Is match me unki current performance (${pStats}) game ka turning point ban sakti hai!`
          : `${pName} is a pivotal ${pRole} for ${pTeam}. Currently at ${pStats}, their decisions right now will heavily influence this contest.`);

      userPrompt = `Sport: ${currentSport}
Match situation: ${currentMatchDesc}
Player: ${pName} (${pRole}, ${pTeam})
Current statistics/figures on field: ${pStats}
Key verified facts: ${pFacts}

Write 3 short sentences (max 60 words): who they are, one iconic highlight, and why they matter at this exact moment of the live match.`;
    } else if (kind === "event") {
      const ev = (eventData as {
        title?: string;
        term?: string;
        over?: string;
        fallbackExplain?: { en: string; hinglish: string };
      }) || {};

      let matchedEvent = ev.title ? ev : null;
      if (!matchedEvent && id) {
        for (const sportConfig of allSportsMatches) {
          const found = sportConfig.events.find((e) => e.id === id);
          if (found) {
            matchedEvent = found;
            break;
          }
        }
      }

      const evTitle = matchedEvent?.title || "Match Event";
      const evTerm = matchedEvent?.term || "Game Rule";
      const evTime = matchedEvent?.over || "Live";

      fallbackText =
        matchedEvent?.fallbackExplain?.[(language as "en" | "hinglish")] ||
        (language === "hinglish"
          ? `${evTitle} match ka ek crucial moment hai. Is rule (${evTerm}) se dono teams ke plans par direct asar padta hai.`
          : `${evTitle} marks a pivotal moment in this match. This rule (${evTerm}) directly shifts tactical pressure between both sides.`);

      userPrompt = `Sport: ${currentSport}
Match situation: ${currentMatchDesc}
Event Title: ${evTitle}
Rule/Term in action: ${evTerm}
Time/Period/Over: ${evTime}

Write exactly 2 short sentences: what this event/rule means in general for ${currentSport}, and what it means for this live match right now.`;
    } else if (kind === "story") {
      // Find matching sport story fallback
      let foundStory = storyFallback;
      for (const sportConfig of allSportsMatches) {
        if (sportConfig.sportName.toLowerCase() === currentSport.toLowerCase()) {
          foundStory = sportConfig.storyFallback;
          break;
        }
      }
      fallbackText = foundStory[(language as "en" | "hinglish")];

      userPrompt = `Sport: ${currentSport}
Match situation: ${currentMatchDesc}

Write a 30-second story of the match so far in 3 to 4 short sentences: how it started, key turning points, and where the contest stands right now.`;
    } else {
      // kind === "question"
      const cleanText = (text as string)?.trim().toLowerCase() || "";

      // Check dictionary across all sports first for instant grounded fallback
      for (const sportConfig of allSportsMatches) {
        for (const [key, val] of Object.entries(sportConfig.rulesDictionary)) {
          if (cleanText.includes(key)) {
            fallbackText = val[(language as "en" | "hinglish")];
            break;
          }
        }
        if (fallbackText) break;
      }

      if (!fallbackText) {
        fallbackText =
          language === "hinglish"
            ? `Yeh sports ka ek important concept hai jo match ke dauraan game ke outcome ko decide karta hai. Match Buddy se aap kisi bhi sport ke baare me aur pooch sakte hain!`
            : `This is a key tactical concept in sports that dictates how players and coaches make strategic decisions under live match pressure.`;
      }

      userPrompt = `Sport context: ${currentSport}
Match situation: ${currentMatchDesc}
User question: "${text}"

Answer this sports question in exactly 2 or 3 friendly, conversational sentences: explain what the rule, term, or strategy means clearly, and how it impacts the match.`;
    }

    // Call Google Gemini API if key is available
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        const result = await geminiModel.generateContentStream(userPrompt);

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream) {
                const textChunk = chunk.text();
                if (textChunk) {
                  controller.enqueue(encoder.encode(textChunk));
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
      } catch (geminiErr) {
        console.warn("Gemini API call encountered an issue, falling back to grounded answer:", geminiErr);
        return new Response(createSimulatedStream(fallbackText), {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }

    // No API key provided: return high-quality verified streaming fallback
    return new Response(createSimulatedStream(fallbackText), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("API route unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
