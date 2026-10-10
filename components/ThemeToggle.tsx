"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("match-buddy-theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("match-buddy-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-surface-raised hover:bg-surface border border-theme flex items-center justify-center text-muted hover:text-foreground transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-ai shadow-sm cursor-pointer"
      id="theme-toggle-btn"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </button>

  );
}
