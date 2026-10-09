"use client";

import React from "react";
import { Zap, ShieldAlert, Sparkles, Flag, ArrowRight, UserCheck } from "lucide-react";
import { MatchEvent, EventType } from "@/data/match";

interface MomentsFeedProps {
  events: MatchEvent[];
  onExplainEvent: (event: MatchEvent) => void;
  recentEventId?: string;
}

export function MomentsFeed({
  events,
  onExplainEvent,
  recentEventId,
}: MomentsFeedProps) {
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "free-hit":
        return <Zap className="w-4 h-4 text-amber-400" />;
      case "drs":
        return <ShieldAlert className="w-4 h-4 text-blue-400" />;
      case "wicket":
        return <span className="text-xs font-bold text-rose-400">W</span>;
      case "powerplay":
        return <Flag className="w-4 h-4 text-emerald-400" />;
      case "impact-player":
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-accent-ai" />;
    }
  };

  return (
    <section className="w-full space-y-3" aria-labelledby="moments-feed-heading">
      <div className="flex items-center justify-between">
        <h2
          id="moments-feed-heading"
          className="text-[13px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2"
        >
          <span>Match Moments Timeline</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-raised border border-theme text-foreground font-medium">
            Newest First
          </span>
        </h2>
      </div>

      <div className="space-y-2.5">
        {events.map((event) => {
          const isNewlyAdded = event.id === recentEventId;

          return (
            <article
              key={event.id}
              className={`w-full p-3.5 rounded-2xl bg-surface border transition-all duration-500 flex items-center justify-between gap-3 shadow-sm ${
                isNewlyAdded
                  ? "border-accent-ai ring-2 ring-accent-ai/50 bg-accent-ai/10 animate-pulse"
                  : "border-theme hover:border-theme/80"
              }`}
            >
              {/* Left: Over & Icon */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-surface-raised border border-theme shrink-0">
                  <div className="mb-0.5">{getEventIcon(event.type)}</div>
                  <span className="text-[10px] font-bold tabular-nums text-text-muted">
                    {event.over}
                  </span>
                </div>

                {/* Event info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-foreground truncate">
                      {event.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${event.badgeColor}`}
                    >
                      {event.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    Rule in action: <span className="text-foreground font-medium">{event.term}</span>
                  </p>
                </div>
              </div>

              {/* Right: Explain Button (min 44px touch target) */}
              <button
                type="button"
                onClick={() => onExplainEvent(event)}
                aria-label={`Explain ${event.title}`}
                className="shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl bg-surface-raised hover:bg-accent-ai hover:text-white border border-theme hover:border-accent-ai text-foreground text-xs font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-ai flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>Explain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
