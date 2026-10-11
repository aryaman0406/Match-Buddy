import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cricketMatch } from "../data/sports/cricket";
import { footballMatch } from "../data/sports/football";
import { basketballMatch } from "../data/sports/basketball";
import { buildSystemPrompt } from "../prompts/system";
import { buildPlayerPrompt } from "../prompts/player";
import { buildEventPrompt } from "../prompts/event";
import { Player, MatchEvent } from "../data/types";

// Configuration defaults
const DELAY_MS = parseInt(process.env.DELAY_MS || "2500", 10);
const HARD_CAP = parseInt(process.env.HARD_CAP || "25", 10);
const OUTPUT_PATH = path.resolve(process.cwd(), "data", "generated", "answers.json");

// Helper to safely load API key without leaking
function loadApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  const envCandidates = [".env.local", ".env"];
  for (const envFile of envCandidates) {
    const filePath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("GEMINI_API_KEY=")) {
          const val = trimmed.slice("GEMINI_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
          if (val) return val;
        }
      }
    }
  }
  return undefined;
}

type GeneratedMap = Record<
  string, // sport
  Record<
    string, // id
    Record<
      string, // kind ("player" | "event")
      Record<
        string, // language ("en" | "hinglish")
        string // answer text
      >
    >
  >
>;

interface WorkItem {
  sport: string;
  id: string;
  kind: "player" | "event";
  language: "en" | "hinglish";
  matchContext: string;
  player?: Player;
  event?: MatchEvent;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error("[ERROR] GEMINI_API_KEY not found in environment or .env.local.");
    console.error("Please ensure GEMINI_API_KEY is configured before running this script.");
    process.exit(1);
  }

  // Load existing answers for resume capability
  let existingData: GeneratedMap = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const raw = fs.readFileSync(OUTPUT_PATH, "utf-8");
      existingData = JSON.parse(raw);
    } catch {
      existingData = {};
    }
  }

  const saveProgress = () => {
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(existingData, null, 2), "utf-8");
  };

  const matches = [cricketMatch, footballMatch, basketballMatch];
  const workItems: WorkItem[] = [];

  for (const match of matches) {
    const sport = match.sportId;
    const matchContext = `${match.teamFullNames.join(" vs ")} (${match.seriesOrLeague}). Score: ${match.scoreDisplay.primary} (${match.scoreDisplay.progress}). ${match.scoreDisplay.secondaryStatus}`;

    // Players
    for (const player of match.players) {
      for (const lang of ["en", "hinglish"] as const) {
        workItems.push({
          sport,
          id: player.id,
          kind: "player",
          language: lang,
          matchContext,
          player,
        });
      }
    }

    // Events
    const allEvents: MatchEvent[] = [...match.events];
    if (match.simulationSequence) {
      for (const step of match.simulationSequence) {
        if (step.newEvent && !allEvents.some((e) => e.id === step.newEvent?.id)) {
          allEvents.push(step.newEvent);
        }
      }
    }

    for (const event of allEvents) {
      for (const lang of ["en", "hinglish"] as const) {
        workItems.push({
          sport,
          id: event.id,
          kind: "event",
          language: lang,
          matchContext,
          event,
        });
      }
    }
  }

  console.log(`\n=== Match Buddy: Pre-Generated Answers Tool ===`);
  console.log(`Total target items across all sports: ${workItems.length}`);
  console.log(`Delay between calls: ${DELAY_MS}ms | Hard cap per run: ${HARD_CAP}`);
  console.log(`Target destination: ${path.relative(process.cwd(), OUTPUT_PATH)}\n`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  let callCount = 0;
  let skippedCount = 0;

  for (const item of workItems) {
    // Check resume state
    const alreadySaved = existingData[item.sport]?.[item.id]?.[item.kind]?.[item.language];
    if (alreadySaved && alreadySaved.trim().length > 0) {
      skippedCount++;
      continue;
    }

    // Check hard cap
    if (callCount >= HARD_CAP) {
      console.log(`\n[HARD CAP REACHED] Made ${callCount} API calls in this run.`);
      console.log(`Stopping cleanly. Progress saved to ${path.relative(process.cwd(), OUTPUT_PATH)}.`);
      console.log(`Run 'npm run generate:answers' again later to continue remaining items.\n`);
      saveProgress();
      process.exit(0);
    }

    // Throttle between consecutive live calls
    if (callCount > 0 && DELAY_MS > 0) {
      await sleep(DELAY_MS);
    }

    const systemInstruction = buildSystemPrompt(item.language, "casual");
    let userPrompt = "";

    if (item.kind === "player" && item.player) {
      userPrompt = buildPlayerPrompt({
        name: item.player.name,
        role: item.player.role,
        team: item.player.country,
        onField: item.player.onField,
        keyFacts: item.player.keyFacts || [],
        sport: item.sport,
        matchContext: item.matchContext,
      });
    } else if (item.kind === "event" && item.event) {
      userPrompt = buildEventPrompt({
        title: item.event.title,
        term: item.event.term,
        timeOrOver: item.event.over,
        sport: item.sport,
        matchContext: item.matchContext,
      });
    }

    const callNumber = callCount + 1;
    console.log(
      `[${callNumber}/${HARD_CAP}] Generating: ${item.sport} > ${item.kind} > ${item.id} (${item.language})...`
    );

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const response = await model.generateContent(userPrompt);
      const text = response.response.text().trim();

      if (!existingData[item.sport]) {
        existingData[item.sport] = {};
      }
      if (!existingData[item.sport][item.id]) {
        existingData[item.sport][item.id] = {};
      }
      if (!existingData[item.sport][item.id][item.kind]) {
        existingData[item.sport][item.id][item.kind] = {};
      }

      existingData[item.sport][item.id][item.kind][item.language] = text;
      callCount++;
      saveProgress();
      console.log(`   -> Saved successfully (${text.length} chars)`);
    } catch (err: unknown) {
      const rawError = err instanceof Error ? err.message : String(err);
      const safeError = rawError.replace(/AIza[0-9A-Za-z-_]{35}/g, "AIza***");

      const isQuota =
        safeError.includes("429") ||
        safeError.toLowerCase().includes("quota") ||
        safeError.toLowerCase().includes("resource_exhausted");

      if (isQuota) {
        console.warn(`\n[QUOTA REACHED] Upstream rate limit or free-tier quota hit.`);
        console.warn(`Stopping cleanly. Progress up to call ${callCount} is saved.`);
        console.warn(`Resume anytime with 'npm run generate:answers' once the quota resets.\n`);
        saveProgress();
        process.exit(0);
      } else {
        console.error(`\n[API ERROR] ${safeError}`);
        saveProgress();
        process.exit(1);
      }
    }
  }

  saveProgress();
  console.log(`\n[COMPLETE] All items processed (Generated: ${callCount}, Skipped: ${skippedCount}).`);
  console.log(`Answers are written to ${path.relative(process.cwd(), OUTPUT_PATH)}.\n`);
}

main().catch((err) => {
  const safeMsg = (err instanceof Error ? err.message : String(err)).replace(
    /AIza[0-9A-Za-z-_]{35}/g,
    "AIza***"
  );
  console.error("[FATAL ERROR]", safeMsg);
  process.exit(1);
});
