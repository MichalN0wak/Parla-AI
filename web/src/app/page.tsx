"use client";

import SessionLanding from "@/components/session/SessionLanding";
import VoiceExperience from "@/components/voice/VoiceExperience";
import PrivacyRail from "@/components/session/PrivacyRail";
import SessionSummary from "@/components/session/SessionSummary";
import { useSessionStore } from "@/store/useSessionStore";

export default function Home() {
  const summary = useSessionStore((state) => state.summary);
  const sessionActive = useSessionStore((state) => state.sessionActive);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:px-8 lg:py-16">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Parla AI · Voice Practice
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold lg:text-4xl">
              Safe practice space for Polish → Italian conversations
            </h1>
            <span className="rounded-full border border-slate-800 px-3 py-1 text-xs tracking-wide text-slate-300">
              Story 1.4 · Conversation shell
            </span>
          </div>
          <p className="max-w-3xl text-base text-slate-300">
            The landing flow collects intent before activating the real-time
            voice experience. Status chips and split layout stay readable on
            tablet and desktop, with microphone cues exposed via ARIA live
            regions.
          </p>
        </header>

        {/* Always render SessionSummary to allow it to generate summary when session ends */}
        <SessionSummary />
        
        {/* Show main content only if no summary is displayed */}
        {!summary && (
          <>
            <SessionLanding />
            <PrivacyRail />
            <VoiceExperience />
          </>
        )}
      </main>
    </div>
  );
}
