export interface PlayerPromptContext {
  name: string;
  role: string;
  team: string;
  onField: string;
  keyFacts: string[];
  sport: string;
  matchContext?: string;
}

export function buildPlayerPrompt(ctx: PlayerPromptContext): string {
  const verifiedFacts = ctx.keyFacts.length > 0 ? ctx.keyFacts.join("\n") : "Key active player";
  const matchStr = ctx.matchContext ? `Current match context: ${ctx.matchContext}` : "";

  return `${matchStr}
Sport: ${ctx.sport}
Player: ${ctx.name} (${ctx.role}, ${ctx.team})
Current figures / stats on field: ${ctx.onField}
Verified career facts:
${verifiedFacts}

Write exactly 2 to 3 short sentences (max 60 words): who they are, one highlight using ONLY the verified facts above, and why they matter at this exact moment of the match.`;
}
