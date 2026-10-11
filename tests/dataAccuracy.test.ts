import { describe, it, expect } from "vitest";
import { basketballMatch } from "../data/sports/basketball";
import { footballMatch } from "../data/sports/football";
import { cricketMatch } from "../data/sports/cricket";
import { buildSystemPrompt } from "../prompts/system";
import { buildPlayerPrompt } from "../prompts/player";
import fs from "fs";
import path from "path";

describe("Data Accuracy & Verification Suite", () => {
  it("Basketball: Austin Reaves is in Lakers lineup and Anthony Davis is removed", () => {
    const lakersPlayerIds = basketballMatch.players.map((p) => p.id);
    expect(lakersPlayerIds).toContain("austin-reaves");
    expect(lakersPlayerIds).not.toContain("anthony-davis");

    const reaves = basketballMatch.players.find((p) => p.id === "austin-reaves");
    expect(reaves).toBeDefined();
    expect(reaves?.name).toBe("Austin Reaves");
    expect(reaves?.role).toBe("Guard");
    expect(reaves?.country).toBe("USA");
    expect(reaves?.homeState).toBe("Born in Newark, Arkansas");
    expect(reaves?.competitions).toContain("NBA");
  });

  it("Birthplace/origin wording accurately configured for specified stars", () => {
    // Vinícius Júnior
    const vinicius = footballMatch.players.find((p) => p.id === "vinicius-jr");
    expect(vinicius?.homeState).toBe("Born in São Gonçalo, Rio de Janeiro state, Brazil");
    expect(vinicius?.keyFacts.some((f) => f.includes("Born in São Gonçalo, Rio de Janeiro state, Brazil"))).toBe(true);

    // Jude Bellingham
    const bellingham = footballMatch.players.find((p) => p.id === "jude-bellingham");
    expect(bellingham?.homeState).toBe("Born in Stourbridge, England");
    expect(bellingham?.keyFacts.some((f) => f.includes("Born in Stourbridge, England"))).toBe(true);

    // Lamine Yamal
    const yamal = footballMatch.players.find((p) => p.id === "lamine-yamal");
    expect(yamal?.homeState).toBe("Born in Esplugues de Llobregat, raised in Mataró, Spain");
    expect(yamal?.keyFacts.some((f) => f.includes("Born in Esplugues de Llobregat, raised in Mataró, Spain"))).toBe(true);

    // Stephen Curry
    const curry = basketballMatch.players.find((p) => p.id === "stephen-curry");
    expect(curry?.homeState).toBe("Born in Akron, Ohio, grew up in Charlotte, North Carolina");
    expect(curry?.keyFacts.some((f) => f.includes("Born in Akron, Ohio, grew up in Charlotte, North Carolina"))).toBe(true);
  });

  it("Cricket: Pat Cummins has T20I in formats list", () => {
    const cummins = cricketMatch.players.find((p) => p.id === "pat-cummins");
    expect(cummins).toBeDefined();
    expect(cummins?.formats).toContain("T20I");
    expect(cummins?.formats).toContain("Test");
    expect(cummins?.formats).toContain("ODI");
  });

  it("Labels: Competitions used for football/basketball, Formats kept for cricket", () => {
    expect(footballMatch.formatsLabel).toBe("Competitions");
    expect(basketballMatch.formatsLabel).toBe("Competitions");
    expect(cricketMatch.formatsLabel).toBe("Formats");

    // Check player property
    for (const player of footballMatch.players) {
      expect(player.competitions).toBeDefined();
      expect(Array.isArray(player.competitions)).toBe(true);
    }
    for (const player of basketballMatch.players) {
      expect(player.competitions).toBeDefined();
      expect(Array.isArray(player.competitions)).toBe(true);
    }
    for (const player of cricketMatch.players) {
      expect(player.formats).toBeDefined();
      expect(Array.isArray(player.formats)).toBe(true);
    }
  });

  it("Scoreboard disclaimer: short visible line is present in MatchHeader component", () => {
    const matchHeaderContent = fs.readFileSync(
      path.join(process.cwd(), "components", "MatchHeader.tsx"),
      "utf-8"
    );
    expect(matchHeaderContent).toContain(
      "Illustrative match scenario. Scores and match stats are fictional; player details come from a curated dataset."
    );
  });

  it("AI Prompts: strictly forbid inventing stats beyond dataset", () => {
    const systemPrompt = buildSystemPrompt("en", "casual");
    expect(systemPrompt).toContain("Never hallucinate, invent, or extrapolate statistics, match numbers, or player details beyond the curated dataset");

    const playerPrompt = buildPlayerPrompt({
      name: "Austin Reaves",
      role: "Guard",
      team: "USA",
      onField: "19 Pts, 6 Ast",
      keyFacts: ["Born in Newark, Arkansas"],
      sport: "Basketball",
    });
    expect(playerPrompt).toContain("Strictly never invent or extrapolate player stats or match numbers beyond this dataset");
  });

  it("TODO verify markers are kept beside all rosters", () => {
    const basketballFile = fs.readFileSync(path.join(process.cwd(), "data", "sports", "basketball.ts"), "utf-8");
    const footballFile = fs.readFileSync(path.join(process.cwd(), "data", "sports", "football.ts"), "utf-8");
    const cricketFile = fs.readFileSync(path.join(process.cwd(), "data", "sports", "cricket.ts"), "utf-8");

    expect(basketballFile).toContain("// TODO verify: Basketball player roster");
    expect(footballFile).toContain("// TODO verify: Football player roster");
    expect(cricketFile).toContain("// TODO verify: Cricket player roster");
  });
});
