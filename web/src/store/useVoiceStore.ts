import { create } from "zustand";

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
  lastError?: string;
  actions: {
    setPhase: (phase: MicPhase) => void;
    setPermission: (permission: PermissionState) => void;
    attachStream: (stream: MediaStream | null) => void;
    setError: (message?: string) => void;
    markUnsupported: (message?: string) => void;
    addTranscript: (line: VoiceLine) => void;
    clearTranscripts: () => void;
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
    reset: () =>
      set({
        micPhase: "idle",
        permission: "unknown",
        mediaStream: null,
        transcripts: [],
        lastError: undefined,
      }),
  };

  return {
    micPhase: "idle",
    permission: "unknown",
    mediaStream: null,
    transcripts: [],
    lastError: undefined,
    actions,
  };
});

