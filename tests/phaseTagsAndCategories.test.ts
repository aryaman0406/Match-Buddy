import { describe, it, expect } from "vitest";
import { cricketMatch, getCricketPhaseTag } from "../data/sports/cricket";
import { footballMatch } from "../data/sports/football";
import { basketballMatch } from "../data/sports/basketball";
import fs from "fs";
import path from "path";

describe("Phase Tags, Categories & Fallback Text Polish Suite", () => {
  it("Cricket Phase Tag Helper: correctly derives POWERPLAY, MIDDLE OVERS, and DEATH OVERS", () => {
    // Powerplay: overs 1-6 (0.1 to 6.0)
    expect(getCricketPhaseTag("0.1")).toBe("POWERPLAY");
    expect(getCricketPhaseTag("3.4")).toBe("POWERPLAY");
    expect(getCricketPhaseTag("5.6")).toBe("POWERPLAY");
    expect(getCricketPhaseTag("6.0")).toBe("POWERPLAY");

    // Middle overs: overs 7-15 (6.1 to 15.0)
    expect(getCricketPhaseTag("6.1")).toBe("MIDDLE OVERS");
    expect(getCricketPhaseTag("12.3")).toBe("MIDDLE OVERS");
    expect(getCricketPhaseTag("13.5")).toBe("MIDDLE OVERS");
    expect(getCricketPhaseTag("14.2")).toBe("MIDDLE OVERS");
    expect(getCricketPhaseTag("15.0")).toBe("MIDDLE OVERS");

    // Death overs: overs 16-20 (15.1 to 20.0)
    expect(getCricketPhaseTag("15.1")).toBe("DEATH OVERS");
    expect(getCricketPhaseTag("18.4")).toBe("DEATH OVERS");
    expect(getCricketPhaseTag("19.6")).toBe("DEATH OVERS");
    expect(getCricketPhaseTag("20.0")).toBe("DEATH OVERS");
  });

  it("Australia DRS event: badge is 'REVIEW LOST', on-field decision stands in title and copy", () => {
    const drsEvent = cricketMatch.events.find((e) => e.id === "evt-drs-review");
    expect(drsEvent).toBeDefined();
    expect(drsEvent?.badgeText).toBe("REVIEW LOST");
    expect(drsEvent?.title).toContain("Review Lost");
    expect(drsEvent?.title).toContain("Decision Stands");
    expect(drsEvent?.category).toBe("review");

    // English copy
    expect(drsEvent?.fallbackExplain.en).toContain("on-field decision stands");
    expect(drsEvent?.fallbackExplain.en).toContain("lost their review");

    // Hinglish copy
    expect(drsEvent?.fallbackExplain.hinglish).toContain("on-field decision barkarar raha");
    expect(drsEvent?.fallbackExplain.hinglish).toContain("review gawa diya");
  });

  it("Reworded cricket event: Starc's yorker dug out, single taken with category 'skill'", () => {
    const yorkerEvent = cricketMatch.events.find((e) => e.id === "evt-starc-yorker");
    expect(yorkerEvent).toBeDefined();
    expect(yorkerEvent?.title).toBe("Starc's yorker dug out, single taken");
    expect(yorkerEvent?.category).toBe("skill");
  });

  it("Every match event across all sports has a valid required category", () => {
    const validCategories = ["rule", "shot", "skill", "review"];
    const allMatches = [cricketMatch, footballMatch, basketballMatch];

    for (const match of allMatches) {
      for (const event of match.events) {
        expect(event.category).toBeDefined();
        expect(validCategories).toContain(event.category);
      }

      if (match.simulationSequence) {
        for (const step of match.simulationSequence) {
          if (step.newEvent) {
            expect(step.newEvent.category).toBeDefined();
            expect(validCategories).toContain(step.newEvent.category);
          }
        }
      }
    }
  });

  it("Fallback texts are specific, mention actual figures and match situation, without filler", () => {
    const allMatches = [cricketMatch, footballMatch, basketballMatch];

    for (const match of allMatches) {
      for (const player of match.players) {
        const enIntro = player.fallbackIntro.en;
        const hingIntro = player.fallbackIntro.hinglish;

        // Must avoid filler
        expect(enIntro).not.toContain("holds the tactical key");
        expect(hingIntro).not.toContain("holds the tactical key");

        // Must mention match figures or context
        expect(enIntro.length).toBeGreaterThan(30);
        expect(hingIntro.length).toBeGreaterThan(30);
      }
    }

    // Verify app/page.tsx does not contain the filler
    const pageContent = fs.readFileSync(path.join(process.cwd(), "app", "page.tsx"), "utf-8");
    expect(pageContent).not.toContain("holds the tactical key");
    expect(pageContent).toContain("break down a match moment");
    expect(pageContent).not.toContain("breakdown a match moment");
  });

  it("Pre-generated answers script and data file exist", () => {
    const scriptPath = path.join(process.cwd(), "scripts", "generate-answers.ts");
    const jsonPath = path.join(process.cwd(), "data", "generated", "answers.json");

    expect(fs.existsSync(scriptPath)).toBe(true);
    expect(fs.existsSync(jsonPath)).toBe(true);

    const scriptContent = fs.readFileSync(scriptPath, "utf-8");
    expect(scriptContent).toContain("OUTPUT_PATH");
    expect(scriptContent).toContain("HARD_CAP");
    expect(scriptContent).toContain("DELAY_MS");
    expect(scriptContent.toLowerCase()).toContain("resource_exhausted");
    expect(scriptContent).not.toContain("AIzaSy"); // No hardcoded API key
  });

  it("Metadata in app/layout.tsx mentions only Cricket, Football, and Basketball with canonical & og:image", () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf-8");

    expect(layoutContent).toContain("https://match-buddy-ruby.vercel.app");
    expect(layoutContent).toContain("/og-image.png");
    expect(layoutContent).not.toContain("maximum-scale=1");
    expect(layoutContent).not.toContain("Tennis");
    expect(layoutContent).not.toContain("F1");
    expect(layoutContent).not.toContain("Kabaddi");

    // og-image.png exists in public
    const ogImagePath = path.join(process.cwd(), "public", "og-image.png");
    expect(fs.existsSync(ogImagePath)).toBe(true);
  });
});
