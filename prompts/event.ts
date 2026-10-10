export interface EventPromptContext {
  title: string;
  term: string;
  timeOrOver: string;
  sport: string;
  matchContext?: string;
}

export function buildEventPrompt(ctx: EventPromptContext): string {
  const matchStr = ctx.matchContext ? `Current match situation: ${ctx.matchContext}` : "";

  return `${matchStr}
Sport: ${ctx.sport}
Event Title: ${ctx.title}
Rule / Term in action: ${ctx.term}
Time / Over: ${ctx.timeOrOver}

Write exactly 2 short sentences (max 50 words): what this event or rule means in general, and what it means for this live match right now.`;
}
