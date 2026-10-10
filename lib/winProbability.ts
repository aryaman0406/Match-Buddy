/**
 * Deterministic Win Probability and Cricket Metric Arithmetic.
 * Pure mathematical functions independent of LLM or external APIs.
 */

/**
 * Converts cricket overs notation (e.g., "14.2" or 14.2) into total legal balls bowled.
 * In cricket notation: 14.2 overs = 14 completed overs (14 * 6 = 84 balls) + 2 balls = 86 balls.
 */
export function oversToBalls(overs: string | number): number {
  const overStr = String(overs).trim();
  if (!overStr) return 0;

  const parts = overStr.split(".");
  const completedOvers = parseInt(parts[0], 10) || 0;
  const partialBalls = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;

  return completedOvers * 6 + partialBalls;
}

/**
 * Converts total balls bowled back into standard cricket overs notation (e.g., 86 balls -> "14.2").
 */
export function ballsToOvers(balls: number): string {
  if (balls <= 0) return "0.0";
  const completedOvers = Math.floor(balls / 6);
  const remainderBalls = balls % 6;
  return `${completedOvers}.${remainderBalls}`;
}

/**
 * Calculates Required Run Rate (RRR) in runs per over (6 balls).
 */
export function calculateRequiredRunRate(runsNeeded: number, ballsLeft: number): number {
  if (runsNeeded <= 0) return 0;
  if (ballsLeft <= 0) return 99.99;
  const rrr = (runsNeeded / ballsLeft) * 6;
  return Math.round(rrr * 100) / 100;
}

/**
 * Calculates Current Run Rate (CRR) in runs per over (6 balls).
 */
export function calculateCurrentRunRate(runsScored: number, ballsBowled: number): number {
  if (runsScored <= 0 || ballsBowled <= 0) return 0;
  const crr = (runsScored / ballsBowled) * 6;
  return Math.round(crr * 100) / 100;
}

export interface CricketWinProbInput {
  runsNeeded: number;
  ballsLeft: number;
  wicketsInHand: number;
  currentRunRate?: number;
}

/**
 * Pure deterministic win probability calculation for cricket run chases.
 * Compares required run rate (RRR) against resource capacity (wickets in hand & balls remaining).
 *
 * Returns rounded integer percentages for [ChasingTeam, DefendingTeam] that strictly sum to 100.
 */
export function calculateCricketWinProbability(input: CricketWinProbInput): { team1: number; team2: number } {
  const { runsNeeded, ballsLeft, wicketsInHand, currentRunRate = 8.0 } = input;

  // Edge cases
  if (runsNeeded <= 0) {
    return { team1: 100, team2: 0 };
  }
  if (wicketsInHand <= 0 || ballsLeft <= 0) {
    return { team1: 0, team2: 100 };
  }

  const rrr = (runsNeeded / ballsLeft) * 6;

  // In T20 cricket, achievable RRR scales strongly with wickets in hand.
  // With 7+ wickets in hand at overs 14-16, death-over baseline par RRR is ~10.2.
  const wicketStrength = Math.min(10, Math.max(1, wicketsInHand));
  const parRRR = 7.0 + (wicketStrength >= 6 ? (wicketStrength - 5) * 1.5 : -(5 - wicketStrength) * 1.4);
  const diffFromPar = parRRR - rrr;

  // Base chasing win probability incorporating required run rate diff and batting momentum
  const momentumAdjustment = (currentRunRate - 8.0) * 0.5;
  let rawChasingProb = 50 + diffFromPar * 6.5 + (wicketStrength - 5) * 4.5 + momentumAdjustment;

  if (rrr > 15.0) {
    rawChasingProb = Math.min(rawChasingProb, 12 * (wicketStrength / 10));
  } else if (rrr < 6.0 && wicketStrength >= 6) {
    rawChasingProb = Math.max(rawChasingProb, 88);
  }

  // Bound strictly between 2% and 98% for active game situations
  const boundedChasing = Math.min(98, Math.max(2, Math.round(rawChasingProb)));
  const defendingProb = 100 - boundedChasing;

  return {
    team1: boundedChasing,
    team2: defendingProb,
  };
}

/**
 * Deterministic win probability for Football (Soccer).
 * Based on score difference and remaining match minutes.
 */
export function calculateFootballWinProbability(
  homeGoals: number,
  awayGoals: number,
  minutesRemaining: number
): { team1: number; team2: number } {
  const diff = homeGoals - awayGoals;
  const timeDecay = Math.max(0.1, minutesRemaining / 90);

  if (diff === 0) {
    return { team1: 50, team2: 50 };
  }

  // For 2-1 lead with 16 mins left: home team ~68%
  let leaderProb = 50 + Math.sign(diff) * (30 * Math.abs(diff)) * (1.1 - timeDecay * 0.5);
  leaderProb = Math.min(96, Math.max(4, Math.round(leaderProb)));

  if (diff > 0) {
    return { team1: leaderProb, team2: 100 - leaderProb };
  } else {
    return { team1: 100 - leaderProb, team2: leaderProb };
  }
}

/**
 * Deterministic win probability for Basketball.
 * Based on point differential and remaining game seconds.
 */
export function calculateBasketballWinProbability(
  leadScore: number,
  trailScore: number,
  secondsRemaining: number
): { team1: number; team2: number } {
  const diff = leadScore - trailScore;
  if (diff === 0) return { team1: 50, team2: 50 };

  // In NBA, a 4 point lead with 2:45 (165s) left gives ~72% probability
  const timeWeight = Math.max(0.1, 1 - secondsRemaining / 720);
  let leadProb = 50 + diff * 5 * (0.8 + timeWeight);
  leadProb = Math.min(98, Math.max(2, Math.round(leadProb)));

  return { team1: leadProb, team2: 100 - leadProb };
}
