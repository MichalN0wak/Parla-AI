"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMicrophoneController } from "@/hooks/useMicrophoneController";
import { useSessionStore } from "@/store/useSessionStore";
import { MicPhase, VoiceLine, useVoiceStore } from "@/store/useVoiceStore";
import { getConversationService } from "@/lib/ai/conversation";
import {
  getTurnOrchestrationService,
  type TurnStatus,
} from "@/lib/ai/turnOrchestration";

const FALLBACK_CONVERSATION: VoiceLine[] = [
  { speaker: "AI", text: "Ciao! Di cosa vuoi parlare oggi?" },
  {
    speaker: "You",
    text: "Vorrei parlare del mio viaggio a Napoli la prossima primavera.",
  },
  {
    speaker: "AI",
    text: "Perfetto! Cominciamo con il motivo del viaggio?",
  },
];

const MOCK_STREAM_RESPONSES: VoiceLine[] = [
  {
    speaker: "System",
    text: "🎙️ Listening for Italian + Polish phrases…",
  },
  {
    speaker: "You",
    text: "Napoli mi ispira per la sua energia e il Vesuvio.",
  },
  {
    speaker: "AI",
    text: "Adoro Napoli! Ti interessano di più i musei o il cibo?",
  },
  {
    speaker: "You",
    text: "In realtà entrambi, ma voglio migliorare il mio italiano parlando con i locali.",
  },
];

const MOCK_LEARNING_CARDS = [
  {
    type: "vocab" as const,
    title: "energia → l'energia",
    detail: "Genere femminile, attenzione all'articolo.",
  },
  {
    type: "grammar" as const,
    title: "In realtà",
    detail: "Espressione utile per correggere o precisare le informazioni.",
  },
];

const phaseIndicator: Record<
  MicPhase,
  { label: string; style: string }
> = {
  idle: {
    label: "Mic idle",
    style: "bg-slate-700/40 text-slate-200",
  },
  requesting: {
    label: "Requesting permission",
    style: "bg-amber-500/20 text-amber-200",
  },
  ready: {
    label: "Mic ready",
    style: "bg-emerald-600/20 text-emerald-200",
  },
  recording: {
    label: "Live capture",
    style: "bg-emerald-500/30 text-emerald-100 animate-pulse",
  },
  unsupported: {
    label: "Mic unsupported",
    style: "bg-rose-500/20 text-rose-200",
  },
  error: {
    label: "Mic error",
    style: "bg-rose-500/20 text-rose-100",
  },
};

const turnStatusIndicator: Record<
  TurnStatus,
  { label: string; style: string }
> = {
  idle: {
    label: "Idle",
    style: "bg-slate-700/40 text-slate-200",
  },
  user_turn: {
    label: "Your turn",
    style: "bg-emerald-500/30 text-emerald-100",
  },
  ai_thinking: {
    label: "AI thinking",
    style: "bg-amber-500/20 text-amber-200 animate-pulse",
  },
  ai_speaking: {
    label: "AI speaking",
    style: "bg-blue-500/30 text-blue-100",
  },
  error: {
    label: "Error",
    style: "bg-rose-500/20 text-rose-200",
  },
};

export default function VoiceExperience() {
  const micPhase = useVoiceStore((state) => state.micPhase);
  const transcripts = useVoiceStore((state) => state.transcripts);
  const turnStatus = useVoiceStore((state) => state.turnStatus);
  const lastError = useVoiceStore((state) => state.lastError);
  const addTranscript = useVoiceStore((state) => state.actions.addTranscript);
  const clearTranscripts = useVoiceStore(
    (state) => state.actions.clearTranscripts,
  );
  const setTurnStatus = useVoiceStore((state) => state.actions.setTurnStatus);
  const voiceReset = useVoiceStore((state) => state.actions.reset);

  const { startRecording, stopRecording, isRecording, requestAccess } =
    useMicrophoneController();

  const topic = useSessionStore((state) => state.topic);
  const proficiency = useSessionStore((state) => state.proficiency);
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const endSession = useSessionStore((state) => state.actions.endSession);

  // Initialize conversation service and turn orchestration when session starts
  useEffect(() => {
    const conversationService = getConversationService();
    const turnService = getTurnOrchestrationService();
    
    if (sessionActive && topic && proficiency) {
      // Initialize conversation with topic and proficiency
      conversationService.initialize({
        topic,
        proficiency,
        sessionId: `session-${Date.now()}`,
      });

      // Set up turn orchestration callbacks
      turnService.setCallbacks({
        onStatusChange: (status) => {
          setTurnStatus(status);
        },
        onLatencyWarning: () => {
          // Show "Still thinking..." message
          addTranscript({
            speaker: "System",
            text: "⏳ Still thinking...",
          });
        },
        onTurnReady: () => {
          // User's turn is ready - can optionally enable mic automatically
        },
      });

      // Get initial greeting and add it to transcripts
      const history = conversationService.getHistory();
      const initialGreeting = history.find((msg) => msg.role === "assistant");
      if (initialGreeting) {
        clearTranscripts();
        addTranscript({
          speaker: "AI",
          text: initialGreeting.content,
        });
        // Queue initial greeting audio - turn will transition to user_turn automatically after audio ends
        turnService.queueAudio(initialGreeting.content);
      }

      // Listen for new messages
      conversationService.onNewMessage((message) => {
        if (message.role === "assistant") {
          addTranscript({
            speaker: "AI",
            text: message.content,
          });
        } else if (message.role === "user") {
          addTranscript({
            speaker: "You",
            text: message.content,
          });
        }
      });
    } else if (!sessionActive) {
      // Reset services when session ends
      conversationService.reset();
      turnService.reset();
    }

    return () => {
      // Cleanup handled by reset above
    };
  }, [sessionActive, topic, proficiency, addTranscript, clearTranscripts, setTurnStatus]);

  useMockTranscriptionFeed({ micPhase, addTranscript, clearTranscripts });

  const conversation = transcripts.length
    ? transcripts
    : FALLBACK_CONVERSATION;

  const indicator = phaseIndicator[micPhase];
  const turnIndicator = turnStatusIndicator[turnStatus];

  const handlePrimaryAction = () => {
    if (!sessionActive) {
      return;
    }
    if (micPhase === "idle") {
      requestAccess();
      return;
    }
    if (isRecording) {
      stopRecording();
      // User finished speaking - trigger AI response
      const turnService = getTurnOrchestrationService();
      turnService.userFinishedSpeaking();
      return;
    }
    // Only allow recording during user's turn
    if (turnStatus === "user_turn" || turnStatus === "idle") {
      startRecording();
    }
  };

  const handleEndSession = () => {
    stopRecording();
    voiceReset();
    const conversationService = getConversationService();
    const turnService = getTurnOrchestrationService();
    conversationService.reset();
    turnService.reset();
    endSession();
  };

  useGlobalShortcuts({
    micPhase,
    sessionActive,
    startRecording,
    stopRecording,
    endSession: handleEndSession,
  });

  const primaryLabel = useMemo(() => {
    if (!sessionActive) {
      return "Start a session first";
    }
    if (micPhase === "unsupported") {
      return "Browser unsupported";
    }
    if (micPhase === "requesting") {
      return "Requesting…";
    }
    if (isRecording) {
      return "Stop capture";
    }
    // Check turn status - only allow recording during user's turn
    if (turnStatus === "ai_thinking" || turnStatus === "ai_speaking") {
      return turnStatus === "ai_thinking" ? "AI thinking..." : "AI speaking...";
    }
    return micPhase === "ready" ? "Start capture" : "Enable microphone";
  }, [isRecording, micPhase, sessionActive, turnStatus]);

  const sessionChip = sessionActive
    ? {
        label: "Session active",
        style: "bg-slate-700/60 text-slate-200",
      }
    : {
        label: "Session idle",
        style: "bg-slate-800/80 text-slate-400",
      };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
      <div className="space-y-4 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
        <div className="flex flex-col gap-4 border-b border-slate-800/60 pb-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Topic
            </p>
            <p className="text-lg text-slate-100">
              {topic
                ? `${topic} · livello ${proficiency ?? "?"}`
                : "Select a topic to begin"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${sessionChip.style}`}
              aria-live="polite"
              role="status"
            >
              {sessionChip.label}
            </span>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${indicator.style}`}
              aria-live="polite"
              role="status"
            >
              {indicator.label}
            </span>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${turnIndicator.style}`}
              aria-live="polite"
              role="status"
            >
              {turnIndicator.label}
            </span>
            <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-semibold text-sky-100">
              Latency target &lt; 2s
            </span>
          </div>
        </div>

        <div className="space-y-3 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1">
          {!sessionActive && (
            <div className="rounded-2xl border border-dashed border-slate-800/80 p-4 text-sm text-slate-400">
              Start a session from the intake form to enable microphone capture.
            </div>
          )}
          {sessionActive &&
            conversation.map(({ speaker, text }, index) => (
              <article
                key={`${speaker}-${index}-${text}`}
                className={`rounded-2xl border border-slate-800/80 p-4 text-sm leading-relaxed ${
                  speaker === "You"
                    ? "bg-slate-900/70 text-slate-100"
                    : speaker === "AI"
                      ? "bg-slate-900/30 text-slate-300"
                      : "bg-slate-950/40 text-slate-200"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {speaker}
                </p>
                <p>{text}</p>
              </article>
            ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Microphone
            </p>
            <p className="text-base text-slate-100">
              {!sessionActive
                ? "Start a session to enable microphone capture."
                : micPhase === "unsupported"
                  ? "Your browser does not expose the required APIs."
                  : turnStatus === "ai_thinking"
                    ? "AI is thinking... Please wait."
                    : turnStatus === "ai_speaking"
                      ? "AI is speaking... Wait for your turn."
                      : turnStatus === "user_turn"
                        ? micPhase === "recording"
                          ? "Streaming audio — transcription mocked locally."
                          : "Your turn — start speaking when ready."
                        : "Ready to capture — start when you're ready."}
            </p>
            {lastError && (
              <p className="text-xs text-rose-300">{lastError}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className={`rounded-full px-6 py-2 text-sm font-semibold shadow-lg transition focus-visible:outline focus-visible:outline-2 ${
                micPhase === "unsupported" || !sessionActive
                  ? "cursor-not-allowed bg-slate-700 text-slate-400 shadow-none"
                  : turnStatus === "ai_thinking" || turnStatus === "ai_speaking"
                    ? "cursor-not-allowed bg-slate-700 text-slate-400 shadow-none"
                    : isRecording
                      ? "bg-rose-400/90 text-rose-950 shadow-rose-500/30"
                      : "bg-emerald-500/80 text-emerald-900 shadow-emerald-500/30"
              }`}
              onClick={handlePrimaryAction}
              disabled={
                micPhase === "unsupported" ||
                micPhase === "requesting" ||
                !sessionActive ||
                turnStatus === "ai_thinking" ||
                turnStatus === "ai_speaking"
              }
            >
              {primaryLabel}
            </button>
            {sessionActive && (
              <button
                onClick={handleEndSession}
                className="rounded-full border border-slate-700/70 px-6 py-2 text-sm font-semibold text-slate-200 hover:border-rose-400 hover:text-rose-200 focus-visible:outline focus-visible:outline-2"
              >
                End session
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/20 p-6 shadow-inner shadow-slate-950/60 lg:sticky lg:top-6 h-fit">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Learning Cards (preview)
            </p>
            <p className="text-lg text-slate-100">
              {isRecording ? "Streaming soon…" : "2 notes captured"}
            </p>
          </div>
          <button className="text-xs font-semibold text-slate-400 underline underline-offset-4">
            Copy all
          </button>
        </div>

        <div className="space-y-3">
          {MOCK_LEARNING_CARDS.map(({ type, title, detail }) => (
            <article
              key={title}
              className={`rounded-2xl border border-slate-800/60 p-4 ${
                type === "vocab"
                  ? "bg-emerald-500/10 text-emerald-100"
                  : "bg-amber-500/10 text-amber-50"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.3em]">
                {type === "vocab" ? "Vocabulary" : "Grammar"}
              </p>
              <p className="text-base font-semibold">{title}</p>
              <p className="text-sm opacity-90">{detail}</p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">
            Local-only data promise
          </p>
          <p>
            Audio stays in the browser during Story 1.2. Later stories will
            route encrypted streams to OpenAI Realtime with short-lived tokens.
          </p>
        </div>
      </aside>
    </section>
  );
}

function useMockTranscriptionFeed({
  micPhase,
  addTranscript,
  clearTranscripts,
}: {
  micPhase: MicPhase;
  addTranscript: (line: VoiceLine) => void;
  clearTranscripts: () => void;
}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const payloadRef = useRef<VoiceLine[]>([]);
  const hasAddedMockData = useRef(false);

  useEffect(() => {
    if (micPhase !== "recording") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = null;
      payloadRef.current = [];
      hasAddedMockData.current = false;
      return;
    }

    // Only add mock data once when recording starts
    // Don't clear existing transcripts (preserve initial greeting from Story 2.1)
    if (!hasAddedMockData.current) {
      hasAddedMockData.current = true;
      payloadRef.current = [...MOCK_STREAM_RESPONSES];

      addTranscript({
        speaker: "System",
        text: "🔄 Connecting to OpenAI Realtime (mock feed)…",
      });

      intervalRef.current = setInterval(() => {
        const next = payloadRef.current.shift();
        if (!next) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return;
        }
        addTranscript(next);
      }, 2200);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [addTranscript, clearTranscripts, micPhase]);
}

function useGlobalShortcuts({
  micPhase,
  sessionActive,
  startRecording,
  stopRecording,
  endSession,
}: {
  micPhase: MicPhase;
  sessionActive: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  endSession: () => void;
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!sessionActive) return;
      // Space toggles mic
      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        if (micPhase === "recording") {
          stopRecording();
        } else {
          startRecording();
        }
      }
      // Escape ends session
      if (event.key === "Escape") {
        event.preventDefault();
        endSession();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [endSession, micPhase, sessionActive, startRecording, stopRecording]);
}

