"use client";

import React from "react";
import { Zap, ShieldAlert, Flag, ArrowRight, UserCheck, Flame, Info } from "lucide-react";
import { MatchEvent, EventType } from "@/data/types";

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
        return <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "drs":
        return <ShieldAlert className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case "wicket":
        return <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "powerplay":
        return <Flag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "impact-player":
        return <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  return (
    <section className="w-full space-y-3" aria-labelledby="moments-feed-heading">
      <div className="flex items-center justify-between px-0.5">
        <h2
          id="moments-feed-heading"
          className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2"
        >
          <span>Key Match Moments</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
        </h2>
        <span className="text-xs font-medium text-muted">
          Live Timeline
        </span>
      </div>

      {events.length === 0 ? (
        <div className="p-4 rounded-2xl glass-panel text-center space-y-1.5 border border-theme">
          <Info className="w-5 h-5 mx-auto text-muted" />
          <p className="text-xs font-semibold text-foreground">No timeline events recorded yet</p>
          <p className="text-xs text-muted">Live match moments will stream in here during play.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((event) => {
            const isNewlyAdded = event.id === recentEventId;

            return (
              <article
                key={event.id}
                className={`w-full p-3 sm:p-3.5 rounded-2xl glass-panel-interactive transition-all duration-300 flex items-center justify-between gap-3 ${
                  isNewlyAdded
                    ? "border-indigo-400/80 ring-2 ring-indigo-400/40 bg-indigo-500/10"
                    : "border-theme"
                }`}
              >
                {/* Left: Over/Minute & Icon */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-surface-raised border border-theme shrink-0">
                    <div className="mb-0.5">{getEventIcon(event.type)}</div>
                    <span className="text-xs font-bold tabular-nums text-muted">
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
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${event.badgeColor}`}
                      >
                        {event.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5 truncate font-medium">
                      Tactical rule: <span className="text-foreground/90 font-semibold">{event.term}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Breakdown button with 44px min touch target */}
                <button
                  type="button"
                  onClick={() => onExplainEvent(event)}
                  aria-label={`Breakdown ${event.title}`}
                  className="shrink-0 min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-surface-raised hover:bg-indigo-600 hover:text-white border border-theme hover:border-indigo-600 text-foreground text-xs font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <span>Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

