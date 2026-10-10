import { describe, it, expect } from "vitest";
import {
  oversToBalls,
  ballsToOvers,
  calculateRequiredRunRate,
  calculateCurrentRunRate,
} from "../lib/winProbability";

describe("Cricket Overs & Balls Arithmetic", () => {
  it("converts 14.2 overs to 86 legal balls", () => {
    // 14 completed overs (14 * 6 = 84 balls) + 2 balls = 86 balls
    expect(oversToBalls("14.2")).toBe(86);
    expect(oversToBalls(14.2)).toBe(86);
  });

  it("converts integer overs to balls accurately", () => {
    expect(oversToBalls("20")).toBe(120);
    expect(oversToBalls(20)).toBe(120);
    expect(oversToBalls("0")).toBe(0);
  });

  it("converts single ball overs accurately", () => {
    expect(oversToBalls("0.1")).toBe(1);
    expect(oversToBalls("0.5")).toBe(5);
    expect(oversToBalls("1.0")).toBe(6);
  });

  it("converts balls back to cricket over string notation", () => {
    expect(ballsToOvers(86)).toBe("14.2");
    expect(ballsToOvers(120)).toBe("20.0");
    expect(ballsToOvers(1)).toBe("0.1");
    expect(ballsToOvers(0)).toBe("0.0");
  });
});

describe("Required Run Rate (RRR) Calculations", () => {
  it("calculates accurate RRR for 54 runs needed off 34 balls", () => {
    // (54 / 34) * 6 = 9.5294... => 9.53
    const rrr = calculateRequiredRunRate(54, 34);
    expect(rrr).toBeCloseTo(9.53, 1);
  });

  it("calculates accurate RRR when target is achieved", () => {
    expect(calculateRequiredRunRate(0, 10)).toBe(0);
    expect(calculateRequiredRunRate(-4, 10)).toBe(0);
  });

  it("handles zero balls left gracefully", () => {
    expect(calculateRequiredRunRate(10, 0)).toBe(99.99);
  });
});

describe("Current Run Rate (CRR) Calculations", () => {
  it("calculates accurate CRR for 112 runs scored in 86 balls (14.2 overs)", () => {
    // (112 / 86) * 6 = 7.8139... => 7.81
    const crr = calculateCurrentRunRate(112, 86);
    expect(crr).toBeCloseTo(7.81, 1);
  });

  it("handles initial match state", () => {
    expect(calculateCurrentRunRate(0, 0)).toBe(0);
  });
});
