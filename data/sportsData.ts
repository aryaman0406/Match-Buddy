// Re-exports for backwards compatibility and clean shared imports
export * from "./types";
export * from "./provider";
export { cricketMatch } from "./sports/cricket";
export { footballMatch } from "./sports/football";
export { basketballMatch } from "./sports/basketball";

import { defaultMatchProvider } from "./provider";
export const allSportsMatches = defaultMatchProvider.getAllMatches();
