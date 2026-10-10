import { SportId, SportMatchConfig, Player, MatchEvent, MatchDataProvider } from "./types";
import { cricketMatch } from "./sports/cricket";
import { footballMatch } from "./sports/football";
import { basketballMatch } from "./sports/basketball";

/**
 * ARCHITECTURE NOTE:
 * MockMatchDataProvider implements the MatchDataProvider interface.
 * In a production deployment with real-time broadcast ingestion, a LiveMatchDataProvider
 * (e.g. streaming via Sportradar, Opta, or RapidAPI WebSockets/REST polling) can implement
 * this exact MatchDataProvider interface and replace MockMatchDataProvider via dependency
 * injection or provider factory, without changing any UI components or AI layer code.
 */
export class MockMatchDataProvider implements MatchDataProvider {
  private matches: Record<SportId, SportMatchConfig> = {
    cricket: cricketMatch,
    football: footballMatch,
    basketball: basketballMatch,
  };

  /**
   * Retrieves full match configuration and live score state for a given sport.
   */
  getMatch(sportId: SportId = "cricket"): SportMatchConfig {
    return this.matches[sportId] || this.matches.cricket;
  }

  /**
   * Retrieves active players on the pitch/court for a given sport.
   */
  getPlayers(sportId: SportId = "cricket"): Player[] {
    return this.getMatch(sportId).players;
  }

  /**
   * Retrieves match timeline events for a given sport.
   */
  getEvents(sportId: SportId = "cricket"): MatchEvent[] {
    return this.getMatch(sportId).events;
  }

  /**
   * Returns all available configured sports matches.
   */
  getAllMatches(): SportMatchConfig[] {
    return [this.matches.cricket, this.matches.football, this.matches.basketball];
  }
}

// Default singleton instance consumed across the application
export const defaultMatchProvider = new MockMatchDataProvider();
