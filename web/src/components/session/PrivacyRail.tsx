"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";

export default function PrivacyRail() {
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const [hasLocalData, setHasLocalData] = useState(false);
  const clearTopicIfNeeded = useSessionStore(
    (state) => state.actions.clearTopicIfNeeded,
  );
  const resetSession = useSessionStore((state) => state.actions.reset);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHasLocalData(Boolean(localStorage.getItem(SESSION_CACHE_KEY)));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClearAll = () => {
    localStorage.removeItem(SESSION_CACHE_KEY);
    setHasLocalData(false);
    resetSession();
  };

  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/20 p-5 text-sm text-slate-300 shadow-inner shadow-slate-950/60" aria-live="polite">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Privacy-first promise
          </p>
          <p className="text-base text-slate-100">
            Conversation metadata is stored only in your browser. End a session
            to clear microphone streams. You can reset inputs anytime.
          </p>
          {!sessionActive && (
            <p className="text-xs text-slate-400">
              When you refocus the topic field after ending a session, the text
              clears automatically.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-full border border-slate-700/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-rose-400 hover:text-rose-200 focus-visible:outline focus-visible:outline-2"
          >
            Clear all local data
          </button>
          <button
            type="button"
            onClick={clearTopicIfNeeded}
            className="rounded-full border border-slate-700/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2"
          >
            Clear topic on focus
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs tracking-wide ${hasLocalData ? "bg-amber-500/20 text-amber-200" : "bg-slate-800 text-slate-400"}`}
          >
            {hasLocalData ? "Local cache present" : "No cached data"}
          </span>
        </div>
      </div>
    </section>
  );
}

const SESSION_CACHE_KEY = "parla-session";

