"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  ProficiencyLevel,
  useSessionStore,
} from "@/store/useSessionStore";
import { useVoiceStore } from "@/store/useVoiceStore";

const PROFICIENCY_LEVELS: ProficiencyLevel[] = ["A2", "B1", "B2"];

export default function SessionLanding() {
  const topic = useSessionStore((state) => state.topic);
  const proficiency = useSessionStore((state) => state.proficiency);
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const { setTopic, setProficiency, startSession, endSession, clearTopicIfNeeded, hydrate } =
    useSessionStore((state) => state.actions);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const voiceActions = useVoiceStore((state) => state.actions);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const topicError = attemptedSubmit && !topic.trim() ? "Please describe a topic (Polish input ok)." : "";
  const levelError = attemptedSubmit && !proficiency ? "Select your current CEFR level." : "";

  const startDisabled = !topic.trim() || !proficiency;

  const handleStart = () => {
    if (startDisabled) {
      setAttemptedSubmit(true);
      return;
    }
    setAttemptedSubmit(false);
    startSession();
    voiceActions.reset();
  };

  const handleEndSession = () => {
    if (!sessionActive) return;
    voiceActions.reset();
    endSession();
  };

  const helperCopy = useMemo(() => {
    if (sessionActive) {
      return "Session running — you can adjust topic later, but changing proficiency requires ending the session.";
    }
    return "Describe any situation in Polish (e.g., 'Chcę rozmawiać o podróży do Neapolu'). The AI will adapt once you start.";
  }, [sessionActive]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLFormElement> = (event) => {
    if (event.key === "Enter" && event.metaKey) {
      event.preventDefault();
      handleStart();
    }
  };

  return (
    <section
      className="space-y-6 rounded-3xl border border-slate-800/70 bg-slate-950/40 p-6 shadow-lg shadow-slate-950/40 backdrop-blur"
      aria-labelledby="session-intake-heading"
    >
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          Story 1.3 · Session intake
        </p>
        <h2 id="session-intake-heading" className="text-2xl font-semibold text-slate-50">
          Choose a topic and level before starting
        </h2>
        <p className="text-sm text-slate-300">{helperCopy}</p>
      </header>

      <form className="space-y-6" onKeyDown={handleKeyDown}>
        <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-200">Conversation topic</span>
        <textarea
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          onFocus={clearTopicIfNeeded}
          placeholder="Np. 'Chcę potrenować rozmowę o pracy we Włoszech'"
          className={clsx(
            "min-h-[92px] w-full rounded-2xl border bg-slate-900/80 p-4 text-sm text-slate-100 outline-none transition",
            topicError
              ? "border-rose-500/60 focus:border-rose-400"
              : "border-slate-800 focus:border-emerald-400",
            sessionActive && "opacity-70"
          )}
          disabled={sessionActive}
        />
        {topicError && <p className="text-xs text-rose-300">{topicError}</p>}
      </label>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-200">Your level</p>
        <div className="flex flex-wrap gap-2">
          {PROFICIENCY_LEVELS.map((level) => {
            const isSelected = proficiency === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setProficiency(level)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2",
                  isSelected
                    ? "bg-emerald-400/90 text-emerald-950 shadow-lg shadow-emerald-500/30"
                    : "border border-slate-700/80 bg-slate-900/60 text-slate-200 hover:border-emerald-400",
                  sessionActive && "cursor-not-allowed opacity-60"
                )}
                disabled={sessionActive}
              >
                {level}
              </button>
            );
          })}
        </div>
        {levelError && <p className="text-xs text-rose-300">{levelError}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={sessionActive || startDisabled}
          className={clsx(
            "rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2",
            sessionActive || startDisabled
              ? "cursor-not-allowed bg-slate-800 text-slate-500"
              : "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400"
          )}
        >
          {sessionActive ? "Session active" : "Start practice"}
        </button>
        {sessionActive && (
          <button
            type="button"
            onClick={handleEndSession}
            className="rounded-full border border-slate-700/80 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-200 focus-visible:outline focus-visible:outline-2"
          >
            End session
          </button>
        )}
      </div>
        <p className="text-xs text-slate-500">
          Shortcut: <kbd className="rounded bg-slate-800 px-1">⌘</kbd> + <kbd className="rounded bg-slate-800 px-1">Enter</kbd> to start when inputs are valid.
        </p>
      </form>
    </section>
  );
}

