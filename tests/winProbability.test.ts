import { describe, it, expect } from "vitest";
import {
  calculateCricketWinProbability,
  calculateFootballWinProbability,
  calculateBasketballWinProbability,
} from "../lib/winProbability";

describe("Deterministic Cricket Win Probability", () => {
  it("calculates realistic chasing probability for 54 runs needed off 34 balls with 7 wickets in hand", () => {
    const result = calculateCricketWinProbability({
      runsNeeded: 54,
      ballsLeft: 34,
      wicketsInHand: 7,
      currentRunRate: 7.8,
    });

    // Sum must strictly equal 100
    expect(result.team1 + result.team2).toBe(100);
    // Chasing team with wickets in hand and moderate RRR should be favored
    expect(result.team1).toBeGreaterThanOrEqual(60);
    expect(result.team1).toBeLessThanOrEqual(75);
  });

  it("favors chasing team heavily when RRR is low and wickets are abundant", () => {
    const result = calculateCricketWinProbability({
      runsNeeded: 18,
      ballsLeft: 24,
      wicketsInHand: 8,
      currentRunRate: 8.5,
    });
    expect(result.team1).toBeGreaterThanOrEqual(80);
    expect(result.team1 + result.team2).toBe(100);
  });

  it("favors defending team when RRR skyrockets and wickets are few", () => {
    const result = calculateCricketWinProbability({
      runsNeeded: 45,
      ballsLeft: 12,
      wicketsInHand: 2,
      currentRunRate: 6.0,
    });
    expect(result.team1).toBeLessThanOrEqual(20);
    expect(result.team2).toBeGreaterThanOrEqual(80);
    expect(result.team1 + result.team2).toBe(100);
  });

  it("handles edge case: target achieved (runsNeeded <= 0)", () => {
    const result = calculateCricketWinProbability({
      runsNeeded: 0,
      ballsLeft: 10,
      wicketsInHand: 6,
    });
    expect(result.team1).toBe(100);
    expect(result.team2).toBe(0);
  });

  it("handles edge case: all out (wicketsInHand === 0)", () => {
    const result = calculateCricketWinProbability({
      runsNeeded: 10,
      ballsLeft: 12,
      wicketsInHand: 0,
    });
    expect(result.team1).toBe(0);
    expect(result.team2).toBe(100);
  });

  it("handles edge case: overs expired (ballsLeft === 0)", () => {
    const result = calculateCricketWinProbability({
      runsNeeded: 5,
      ballsLeft: 0,
      wicketsInHand: 5,
    });
    expect(result.team1).toBe(0);
    expect(result.team2).toBe(100);
  });
});

describe("Deterministic Football & Basketball Probability", () => {
  it("calculates football probability for 2-1 lead with 16 mins remaining", () => {
    const result = calculateFootballWinProbability(2, 1, 16);
    expect(result.team1 + result.team2).toBe(100);
    expect(result.team1).toBeGreaterThan(60);
  });

  it("calculates basketball probability for 4-point lead late in 4th quarter", () => {
    const result = calculateBasketballWinProbability(108, 104, 165);
    expect(result.team1 + result.team2).toBe(100);
    expect(result.team1).toBeGreaterThan(65);
  });
});
