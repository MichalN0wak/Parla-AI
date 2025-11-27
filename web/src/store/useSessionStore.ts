import { create } from "zustand";
import type { SessionSummary } from "@/lib/ai/sessionSummary";

export type ProficiencyLevel = "A2" | "B1" | "B2";

interface SessionState {
  topic: string;
  proficiency: ProficiencyLevel | null;
  sessionActive: boolean;
  shouldClearOnFocus: boolean;
  cachedAt?: number | null;
  sessionStartTime?: number | null;
  summary: SessionSummary | null;
  actions: {
    setTopic: (topic: string) => void;
    setProficiency: (level: ProficiencyLevel) => void;
    startSession: () => void;
    endSession: () => void;
    clearTopicIfNeeded: () => void;
    setSummary: (summary: SessionSummary | null) => void;
    hydrate: () => void;
    reset: () => void;
  };
}

export const useSessionStore = create<SessionState>((set) => {
  const actions: SessionState["actions"] = {
    setTopic: (topic) =>
      set({
        topic,
      }),
    setProficiency: (level) =>
      set({
        proficiency: level,
      }),
    startSession: () =>
      set((state) => {
        const next = {
          sessionActive: true,
          shouldClearOnFocus: false,
          topic: state.topic.trim(),
          sessionStartTime: Date.now(),
          summary: null, // Clear any previous summary
        };
        cacheSession({ ...state, ...next });
        return next;
      }),
    endSession: () =>
      set((state) => {
        const next = {
          sessionActive: false,
          shouldClearOnFocus: Boolean(state.topic),
          cachedAt: Date.now(),
        };
        cacheSession({ ...state, ...next });
        return next;
      }),
    setSummary: (summary) =>
      set({ summary }),
    clearTopicIfNeeded: () =>
      set((state) => {
        if (!state.shouldClearOnFocus) return state;
        const next = {
          topic: "",
          shouldClearOnFocus: false,
        };
        cacheSession({ ...state, ...next });
        return next;
      }),
    hydrate: () => {
      const existing = readCachedSession();
      if (!existing) return;
      set(existing);
    },
    reset: () =>
      set(() => {
        localStorage.removeItem(SESSION_CACHE_KEY);
        return {
          topic: "",
          proficiency: null,
          sessionActive: false,
          shouldClearOnFocus: false,
          cachedAt: null,
          sessionStartTime: null,
          summary: null,
        };
      }),
  };

  return {
    topic: "",
    proficiency: null,
    sessionActive: false,
    shouldClearOnFocus: false,
    cachedAt: null,
    sessionStartTime: null,
    summary: null,
    actions,
  };
});

type CachedSession = Omit<SessionState, "actions">;

const SESSION_CACHE_KEY = "parla-session";

const cacheSession = (state: CachedSession) => {
  try {
    localStorage.setItem(
      SESSION_CACHE_KEY,
      JSON.stringify({ ...state, cachedAt: Date.now() }),
    );
  } catch {
    // Ignore quota errors
  }
};

const readCachedSession = (): CachedSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

