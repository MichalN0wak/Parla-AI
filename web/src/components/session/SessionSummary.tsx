"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { getSessionSummaryService } from "@/lib/ai/sessionSummary";
import { getConversationService } from "@/lib/ai/conversation";

export default function SessionSummary() {
  const summary = useSessionStore((state) => state.summary);
  const topic = useSessionStore((state) => state.topic);
  const proficiency = useSessionStore((state) => state.proficiency);
  const sessionStartTime = useSessionStore((state) => state.sessionStartTime);
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const setSummary = useSessionStore((state) => state.actions.setSummary);
  const clearTopicIfNeeded = useSessionStore(
    (state) => state.actions.clearTopicIfNeeded,
  );

  // Generate summary when session ends
  useEffect(() => {
    if (!sessionActive && sessionStartTime && topic && proficiency && !summary) {
      const conversationService = getConversationService();
      const summaryService = getSessionSummaryService();
      const messages = conversationService.getHistory();

      const generatedSummary = summaryService.generateSummary(
        messages,
        topic,
        proficiency,
        sessionStartTime,
      );

      setSummary(generatedSummary);

      // Debug log in development
      if (process.env.NODE_ENV === "development") {
        console.log("📊 Session summary generated:", generatedSummary);
      }
    }
  }, [
    sessionActive,
    sessionStartTime,
    topic,
    proficiency,
    summary,
    setSummary,
  ]);

  // Clear summary when returning to landing (privacy)
  useEffect(() => {
    if (sessionActive && summary) {
      // Session restarted - clear summary
      setSummary(null);
    }
  }, [sessionActive, summary, setSummary]);

  if (!summary) {
    return null;
  }

  return (
    <section
      className="space-y-6 rounded-3xl border border-slate-800/70 bg-slate-950/40 p-6 shadow-lg shadow-slate-950/40 backdrop-blur"
      aria-labelledby="session-summary-heading"
    >
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          Story 2.5 · Session summary
        </p>
        <h2
          id="session-summary-heading"
          className="text-2xl font-semibold text-slate-50"
        >
          Riepilogo della sessione
        </h2>
        <p className="text-sm text-slate-300">
          Ecco cosa hai fatto bene durante questa sessione di pratica.
        </p>
      </header>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Punti salienti
          </h3>
          <ul className="space-y-2">
            {summary.highlights.map((highlight, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-slate-200"
              >
                <span className="mt-1 text-emerald-400">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Prossimo argomento suggerito
          </h3>
          <p className="text-base font-medium text-emerald-300">
            {summary.suggestedNextTopic}
          </p>
        </div>

        {summary.isShortSession && (
          <div className="rounded-2xl border border-amber-800/60 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-200">
              💡 Questa è stata una sessione breve. La prossima volta, prova a
              praticare un po' più a lungo per ottenere maggiori benefici!
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setSummary(null);
            clearTopicIfNeeded();
          }}
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2"
        >
          Torna alla schermata iniziale
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Il riepilogo viene cancellato automaticamente quando inizi una nuova
        sessione per rispettare la tua privacy.
      </p>
    </section>
  );
}

