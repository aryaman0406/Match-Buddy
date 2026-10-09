# Match Buddy - Dream11 FDE Intern Assignment Rules

## Product
Match Buddy is an AI companion for casual fans watching a live cricket match. A casual fan taps a player to get a quick AI intro with why they matter right now, or taps an event or types a rule (free hit, DRS, LBW, DLS, super over) to get a two-line explanation tied to the current match situation. Works in English and Hinglish (Hindi written in Roman letters).

## Tech Rules
- Next.js (App Router), TypeScript, Tailwind CSS. No other UI libraries except lucide-react for icons.
- Mobile-first (360-430px), centred max-width 480px container on desktop.
- All match data is mocked in `/data/match.ts`. No database, no login.
- The AI call happens ONLY in a server route `/app/api/explain/route.ts`. Never expose API keys to the client. Read `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` from environment variables.
- Keep code simple, commented, and easy for a beginner to explain in an interview. Prefer small components over clever abstractions.
