export interface StoryPromptContext {
  matchContext: string;
  sport: string;
}

export function buildStoryPrompt(ctx: StoryPromptContext): string {
  return `Sport: ${ctx.sport}
Current match situation: ${ctx.matchContext}

Write a 30-second story of the match so far in 3 to 4 short sentences (under 60 words): how it started, key turning points, and where the contest stands right now.`;
}
