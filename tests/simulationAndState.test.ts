import { describe, it, expect } from "vitest";
import { cricketMatch } from "../data/sports/cricket";
import { footballMatch } from "../data/sports/football";
import { basketballMatch } from "../data/sports/basketball";
import { calculateCricketWinProbability, calculateRequiredRunRate, oversToBalls } from "../lib/winProbability";

describe("Sports Simulation Data Consistency", () => {
  it("Cricket initial match state is mathematically consistent", () => {
    // Score 112/3, 14.2 overs
    const ballsBowled = oversToBalls("14.2");
    expect(ballsBowled).toBe(86);

    const ballsRemaining = 120 - ballsBowled;
    expect(ballsRemaining).toBe(34);

    // Target 166 => 54 needed
    const runsNeeded = 54;
    const rrr = calculateRequiredRunRate(runsNeeded, ballsRemaining);
    expect(rrr).toBe(9.53);

    expect(cricketMatch.scoreDisplay.secondaryStatus).toContain("Need 54 off 34 balls · RRR 9.53");

    // Win probability
    const wp = calculateCricketWinProbability({
      runsNeeded,
      ballsLeft: ballsRemaining,
      wicketsInHand: 7,
      currentRunRate: 7.81,
    });
    expect(wp.team1 + wp.team2).toBe(100);
    expect(cricketMatch.winProbability.team1 + cricketMatch.winProbability.team2).toBe(100);
  });

  it("Cricket simulation steps never exceed 20 overs or target boundaries", () => {
    const steps = cricketMatch.simulationSequence || [];
    expect(steps.length).toBeGreaterThan(0);

    for (const step of steps) {
      if (step.cricketState) {
        expect(step.cricketState.ballsLeft).toBeGreaterThan(0);
        expect(step.cricketState.ballsLeft).toBeLessThanOrEqual(120);
        expect(step.cricketState.runsNeeded).toBeGreaterThan(0);
        expect(step.cricketState.wicketsInHand).toBeGreaterThanOrEqual(1);
        expect(step.cricketState.wicketsInHand).toBeLessThanOrEqual(10);
      }
      if (step.winProbability) {
        expect(step.winProbability.team1 + step.winProbability.team2).toBe(100);
        expect(step.winProbability.team1).toBeGreaterThanOrEqual(0);
        expect(step.winProbability.team1).toBeLessThanOrEqual(100);
      }
    }
  });

  it("Football initial state is consistent", () => {
    expect(footballMatch.scoreDisplay.primary).toBe("2 - 1");
    expect(footballMatch.winProbability.team1 + footballMatch.winProbability.team2).toBe(100);
    expect(footballMatch.players.some((p) => p.isStriker)).toBe(true);
  });

  it("Basketball initial state is consistent", () => {
    expect(basketballMatch.scoreDisplay.primary).toBe("108 - 104");
    expect(basketballMatch.winProbability.team1 + basketballMatch.winProbability.team2).toBe(100);
    expect(basketballMatch.players.some((p) => p.isStriker)).toBe(true);
  });
});
