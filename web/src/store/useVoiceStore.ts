import { create } from "zustand";
import type { TurnStatus } from "@/lib/ai/turnOrchestration";

export type VoiceSpeaker = "AI" | "You" | "System";

export type VoiceLine = {
  speaker: VoiceSpeaker;
  text: string;
};

export type MicPhase =
  | "idle"
  | "unsupported"
  | "requesting"
  | "ready"
  | "recording"
  | "error";

type PermissionState = "unknown" | "granted" | "denied";

interface VoiceStore {
  micPhase: MicPhase;
  permission: PermissionState;
  mediaStream: MediaStream | null;
  transcripts: VoiceLine[];
  turnStatus: TurnStatus;
  lastError?: string;
  actions: {
    setPhase: (phase: MicPhase) => void;
    setPermission: (permission: PermissionState) => void;
    attachStream: (stream: MediaStream | null) => void;
    setError: (message?: string) => void;
    markUnsupported: (message?: string) => void;
    addTranscript: (line: VoiceLine) => void;
    clearTranscripts: () => void;
    setTurnStatus: (status: TurnStatus) => void;
    reset: () => void;
  };
}

export const useVoiceStore = create<VoiceStore>((set) => {
  const setPhase: VoiceStore["actions"]["setPhase"] = (phase) =>
    set({ micPhase: phase });

  const actions: VoiceStore["actions"] = {
    setPhase,
    setPermission: (permission) => set({ permission }),
    attachStream: (stream) => set({ mediaStream: stream }),
    setError: (message) =>
      set((state) => ({
        lastError: message,
        micPhase: message ? "error" : state.micPhase,
      })),
    markUnsupported: (message) =>
      set({
        micPhase: "unsupported",
        lastError:
          message ??
          "Your browser does not expose microphone capture APIs. Try Chrome, Edge, or Safari 16+.",
      }),
    addTranscript: (line) =>
      set((state) => ({
        transcripts: [...state.transcripts, line],
      })),
    clearTranscripts: () => set({ transcripts: [] }),
    setTurnStatus: (status) => set({ turnStatus: status }),
    reset: () =>
      set({
        micPhase: "idle",
        permission: "unknown",
        mediaStream: null,
        transcripts: [],
        turnStatus: "idle",
        lastError: undefined,
      }),
  };

  return {
    micPhase: "idle",
    permission: "unknown",
    mediaStream: null,
    transcripts: [],
    turnStatus: "idle",
    lastError: undefined,
    actions,
  };
});

