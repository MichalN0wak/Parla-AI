export type TokenLanguage = "it" | "pl";

export interface TaggedToken {
  value: string;
  normalized: string;
  language: TokenLanguage;
  confidence: number;
}

export interface TranscriptStats {
  italian: number;
  polish: number;
  mixingRatio: number;
}

export type TranscriptionProvider = "web-speech" | "fallback";
export type TranscriptionReliability = "native" | "heuristic";

export interface DualLanguageTranscriptionResult {
  transcript: string;
  tokens: TaggedToken[];
  provider: TranscriptionProvider;
  reliability: TranscriptionReliability;
  isFinal: boolean;
  timestamp: number;
  stats: TranscriptStats;
  isTranslationRequest?: boolean; // Flag for Push-to-Ask Polish questions
}


