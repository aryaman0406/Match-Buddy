// Shared TypeScript types for sports data, matches, players, events, and provider interfaces.

export type SportId = "cricket" | "football" | "basketball";

export interface Player {
  id: string;
  name: string;
  role: "Batter" | "Bowler" | "Attacker" | "Defender" | "Midfielder" | "Goalkeeper" | "Guard" | "Forward" | "Center";
  onField: string;
  country: string;
  homeState?: string;
  formats?: string[];
  isStriker?: boolean; // In cricket: batter on strike facing delivery. In other sports: primary active attacker.
  avatarInitials: string;
  keyFacts: string[];
  fallbackIntro: {
    en: string;
    hinglish: string;
  };
}

export type EventType = "free-hit" | "drs" | "wicket" | "powerplay" | "impact-player";

export interface MatchEvent {
  id: string;
  over: string; // over in cricket (e.g. "14.2") or game minute/quarter in football/basketball (e.g. "74'", "Q4 3:12")
  type: EventType;
  title: string;
  term: string;
  badgeText: string;
  badgeColor: string;
  timestamp?: string;
  fallbackExplain: {
    en: string;
    hinglish: string;
  };
}

export interface MatchSituation {
  teams: [string, string];
  series: string;
  score: string;
  overs: string;
  totalOvers: number;
  target: number;
  ballsLeft: number;
  runsNeeded: number;
  requiredRunRate: number;
  currentOverBalls?: number;
}

export interface SportSimulationStep {
  scorePrimary: string;
  progressText: string;
  progressPercent: number;
  secondaryStatus: string;
  activePerformerId: string;
  playerStatsUpdates?: { [playerId: string]: string };
  winProbability?: { team1: number; team2: number };
  commentary?: string;
  newEvent?: MatchEvent;
  // Cricket specific fields for exact probability calculation
  cricketState?: {
    runsNeeded: number;
    ballsLeft: number;
    wicketsInHand: number;
    currentRunRate: number;
    requiredRunRate: number;
  };
}

export interface SportMatchConfig {
  id: string;
  sportId: SportId;
  sportName: string;
  sportIcon: string;
  matchTitle: string;
  seriesOrLeague: string;
  teams: [string, string];
  teamFullNames: [string, string];
  winProbability: { team1: number; team2: number };
  scoreDisplay: {
    primary: string;
    primaryLabel: string;
    progress: string;
    progressPercent: number;
    secondaryStatus: string;
  };
  players: Player[];
  events: MatchEvent[];
  storyFallback: {
    en: string;
    hinglish: string;
  };
  quickQuestions: string[];
  rulesDictionary: Record<string, { term: string; en: string; hinglish: string }>;
  simulationSequence?: SportSimulationStep[];
}

/**
 * MatchDataProvider interface defining access to live or mock match, player and event feeds.
 * UI and AI components consume strictly this contract.
 */
export interface MatchDataProvider {
  getMatch(sportId: SportId): SportMatchConfig;
  getPlayers(sportId: SportId): Player[];
  getEvents(sportId: SportId): MatchEvent[];
  getAllMatches(): SportMatchConfig[];
}
