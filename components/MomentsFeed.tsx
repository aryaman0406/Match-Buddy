"use client";

import React from "react";
import { Zap, ShieldAlert, Flag, ArrowRight, UserCheck, Flame } from "lucide-react";
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
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case "drs":
        return <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />;
      case "wicket":
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case "powerplay":
        return <Flag className="w-3.5 h-3.5 text-emerald-400" />;
      case "impact-player":
        return <UserCheck className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <section className="w-full space-y-3" aria-labelledby="moments-feed-heading">
      <div className="flex items-center justify-between px-0.5">
        <h2
          id="moments-feed-heading"
          className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2"
        >
          <span>Key Match Moments</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </h2>
        <span className="text-[11px] font-medium text-text-muted">
          Live Timeline
        </span>
      </div>

      <div className="space-y-2.5">
        {events.map((event) => {
          const isNewlyAdded = event.id === recentEventId;

          return (
            <article
              key={event.id}
              className={`w-full p-3 sm:p-3.5 rounded-2xl glass-panel-interactive transition-all duration-300 flex items-center justify-between gap-3 ${
                isNewlyAdded
                  ? "border-indigo-400/80 ring-2 ring-indigo-400/40 bg-indigo-500/10"
                  : "border-white/[0.07]"
              }`}
            >
              {/* Left: Over/Minute & Icon */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] shrink-0">
                  <div className="mb-0.5">{getEventIcon(event.type)}</div>
                  <span className="text-[9px] font-bold tabular-nums text-text-muted">
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
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border uppercase tracking-wider ${event.badgeColor}`}
                    >
                      {event.badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 truncate font-medium">
                    Tactical rule: <span className="text-foreground/90 font-semibold">{event.term}</span>
                  </p>
                </div>
              </div>

              {/* Right: Breakdown button */}
              <button
                type="button"
                onClick={() => onExplainEvent(event)}
                aria-label={`Breakdown ${event.title}`}
                className="shrink-0 min-h-[40px] px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-indigo-500 hover:text-white border border-white/[0.08] hover:border-indigo-500 text-foreground text-xs font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>Breakdown</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
