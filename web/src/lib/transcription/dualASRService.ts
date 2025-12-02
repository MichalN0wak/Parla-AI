/**
 * Dual ASR Service - Push-to-Ask Implementation
 * 
 * Manages two separate Web Speech API instances:
 * - Italian (default, continuous)
 * - Polish (helper mode, single phrase)
 * 
 * This solves the code-switching detection problem by using explicit
 * language switching instead of trying to detect garbled transcriptions.
 */

import { tagTokens } from "@/lib/transcription/tokenTagger";
import type {
  DualLanguageTranscriptionResult,
  TranscriptionProvider,
  TranscriptionReliability,
  TranscriptStats,
} from "@/lib/transcription/types";

export type ASRMode = "italian" | "polish" | "switching";

type CallbackMap = {
  onResult?: (result: DualLanguageTranscriptionResult) => void;
  onFinalResult?: (result: DualLanguageTranscriptionResult) => void;
  onWarning?: (message: string) => void;
  onError?: (message: string) => void;
  onModeChange?: (mode: ASRMode) => void;
};

export class DualASRService {
  private italianRecognition: SpeechRecognition | null = null;
  private polishRecognition: SpeechRecognition | null = null;
  private callbacks: CallbackMap = {};
  private mode: ASRMode = "italian";
  private isItalianListening = false;
  private isPolishListening = false;
  private provider: TranscriptionProvider = "web-speech";
  private reliability: TranscriptionReliability = "native";
  private switchingTimeout: NodeJS.Timeout | null = null;
  private polishTimeout: NodeJS.Timeout | null = null;
  private readonly POLISH_MODE_TIMEOUT = 10000; // 10 seconds max in Polish mode

  constructor() {
    if (typeof window !== "undefined") {
      this.setupItalianRecognition();
      this.setupPolishRecognition();
    }
  }

  setCallbacks(callbacks: CallbackMap): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Start Italian recognition (default mode)
   */
  startItalian(): void {
    if (this.mode !== "italian") {
      console.warn("Cannot start Italian: not in Italian mode");
      return;
    }

    if (!this.italianRecognition) {
      if (!this.setupItalianRecognition()) {
        this.callbacks.onError?.("Italian recognition not available");
        return;
      }
    }

    if (this.isItalianListening) {
      return; // Already listening
    }

    try {
      if (this.italianRecognition) {
        this.italianRecognition.start();
        this.isItalianListening = true;
      }
    } catch (error) {
      const message =
        error instanceof DOMException ? error.message : "Italian recognition start failed";
      this.callbacks.onError?.(message);
    }
  }

  /**
   * Stop Italian recognition
   */
  stopItalian(): void {
    if (!this.italianRecognition || !this.isItalianListening) {
      return;
    }

    try {
      this.italianRecognition.stop();
    } catch {
      // Ignore stop errors
    } finally {
      this.isItalianListening = false;
    }
  }

  /**
   * Switch to Polish mode for asking questions
   * Stops Italian, waits briefly, then starts Polish
   */
  async switchToPolish(): Promise<void> {
    if (this.mode === "polish") {
      return; // Already in Polish mode
    }

    // Stop Italian first
    this.stopItalian();

    // Update mode to switching
    this.mode = "switching";
    this.callbacks.onModeChange?.(this.mode);

    // Wait for browser to release audio stream (100-200ms safety timeout)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Start Polish recognition
    if (!this.polishRecognition) {
      if (!this.setupPolishRecognition()) {
        this.callbacks.onError?.("Polish recognition not available");
        this.mode = "italian";
        this.callbacks.onModeChange?.(this.mode);
        this.startItalian(); // Fallback to Italian
        return;
      }
    }

    try {
      if (!this.polishRecognition) {
        throw new Error("Polish recognition not initialized");
      }
      
      this.mode = "polish";
      this.callbacks.onModeChange?.(this.mode);
      this.polishRecognition.start();
      this.isPolishListening = true;

      // Set timeout to auto-return to Italian after max time
      this.polishTimeout = setTimeout(() => {
        if (this.mode === "polish") {
          this.switchToItalian();
        }
      }, this.POLISH_MODE_TIMEOUT);
    } catch (error) {
      const message =
        error instanceof DOMException ? error.message : "Polish recognition start failed";
      this.callbacks.onError?.(message);
      this.mode = "italian";
      this.callbacks.onModeChange?.(this.mode);
      this.startItalian(); // Fallback to Italian
    }
  }

  /**
   * Switch back to Italian mode
   * Stops Polish and restarts Italian
   */
  async switchToItalian(): Promise<void> {
    if (this.mode === "italian") {
      return; // Already in Italian mode
    }

    // Clear Polish timeout
    if (this.polishTimeout) {
      clearTimeout(this.polishTimeout);
      this.polishTimeout = null;
    }

    // Stop Polish
    if (this.polishRecognition && this.isPolishListening) {
      try {
        this.polishRecognition.stop();
      } catch {
        // Ignore stop errors
      } finally {
        this.isPolishListening = false;
      }
    }

    // Update mode to switching
    this.mode = "switching";
    this.callbacks.onModeChange?.(this.mode);

    // Wait for browser to release audio stream
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Restart Italian
    this.mode = "italian";
    this.callbacks.onModeChange?.(this.mode);
    this.startItalian();
  }

  /**
   * Get current mode
   */
  getMode(): ASRMode {
    return this.mode;
  }

  /**
   * Check if currently in Polish mode
   */
  isPolishMode(): boolean {
    return this.mode === "polish";
  }

  /**
   * Setup Italian recognition instance
   */
  private setupItalianRecognition(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const Constructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Constructor) {
      return false;
    }

    this.italianRecognition = new Constructor();
    this.italianRecognition.lang = "it-IT";
    this.italianRecognition.continuous = true;
    this.italianRecognition.interimResults = true;
    this.italianRecognition.maxAlternatives = 1;

    this.italianRecognition.onresult = (event) =>
      this.handleItalianResult(event);
    this.italianRecognition.onerror = (event) => {
      const message =
        event.message || `Italian recognition error: ${event.error}`;
      this.callbacks.onError?.(message);
    };
    this.italianRecognition.onend = () => {
      this.isItalianListening = false;
      // Auto-restart if we're still in Italian mode (unless manually stopped)
      if (this.mode === "italian" && !this.isPolishListening) {
        // Small delay before restart to avoid rapid reconnection
        setTimeout(() => {
          if (this.mode === "italian" && !this.isItalianListening) {
            this.startItalian();
          }
        }, 500);
      }
    };

    return true;
  }

  /**
   * Setup Polish recognition instance
   */
  private setupPolishRecognition(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const Constructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Constructor) {
      return false;
    }

    this.polishRecognition = new Constructor();
    this.polishRecognition.lang = "pl-PL";
    this.polishRecognition.continuous = false; // Single phrase mode
    this.polishRecognition.interimResults = true;
    this.polishRecognition.maxAlternatives = 1;

    this.polishRecognition.onresult = (event) =>
      this.handlePolishResult(event);
    this.polishRecognition.onerror = (event) => {
      const message =
        event.message || `Polish recognition error: ${event.error}`;
      this.callbacks.onError?.(message);
      // On error, return to Italian
      if (this.mode === "polish") {
        this.switchToItalian();
      }
    };
    this.polishRecognition.onend = () => {
      this.isPolishListening = false;
      // Auto-return to Italian when Polish recognition ends
      if (this.mode === "polish") {
        this.switchToItalian();
      }
    };

    return true;
  }

  /**
   * Handle Italian recognition results
   */
  private handleItalianResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.results.length - 1];
    if (!result || result.length === 0) {
      return;
    }

    const transcript = result[0].transcript.trim();
    if (!transcript) {
      return;
    }

    const tokens = tagTokens(transcript);
    const payload: DualLanguageTranscriptionResult = {
      transcript,
      tokens,
      provider: this.provider,
      reliability: this.reliability,
      isFinal: result.isFinal ?? false,
      timestamp: Date.now(),
      stats: this.computeStats(tokens),
    };

    this.callbacks.onResult?.(payload);
    if (payload.isFinal) {
      this.callbacks.onFinalResult?.(payload);
    }
  }

  /**
   * Handle Polish recognition results
   * Polish results are always treated as translation requests
   */
  private handlePolishResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.results.length - 1];
    if (!result || result.length === 0) {
      return;
    }

    const transcript = result[0].transcript.trim();
    if (!transcript) {
      return;
    }

    // Polish transcripts are clean (no garbling), so we can use simple token tagging
    // All tokens in Polish mode are marked as Polish
    const tokens = tagTokens(transcript).map((token) => ({
      ...token,
      language: "pl" as const,
      confidence: 0.95, // High confidence since we're in Polish mode
    }));

    const payload: DualLanguageTranscriptionResult = {
      transcript,
      tokens,
      provider: this.provider,
      reliability: this.reliability,
      isFinal: result.isFinal ?? false,
      timestamp: Date.now(),
      stats: this.computeStats(tokens),
      // Flag this as a translation request
      isTranslationRequest: true,
    };

    this.callbacks.onResult?.(payload);
    if (payload.isFinal) {
      this.callbacks.onFinalResult?.(payload);
    }
  }

  private computeStats(
    tokens: DualLanguageTranscriptionResult["tokens"],
  ): TranscriptStats {
    const italian = tokens.filter((token) => token.language === "it").length;
    const polish = tokens.filter((token) => token.language === "pl").length;
    const total = Math.max(tokens.length, 1);
    return {
      italian,
      polish,
      mixingRatio: polish / total,
    };
  }

  /**
   * Cleanup and reset
   */
  reset(): void {
    this.stopItalian();
    if (this.polishRecognition && this.isPolishListening) {
      try {
        this.polishRecognition.stop();
      } catch {
        // Ignore
      }
    }
    if (this.polishTimeout) {
      clearTimeout(this.polishTimeout);
    }
    if (this.switchingTimeout) {
      clearTimeout(this.switchingTimeout);
    }
    this.mode = "italian";
    this.isItalianListening = false;
    this.isPolishListening = false;
  }
}

/**
 * Singleton instance
 */
let dualASRServiceInstance: DualASRService | null = null;

/**
 * Get or create the dual ASR service instance
 */
export function getDualASRService(): DualASRService {
  if (!dualASRServiceInstance) {
    dualASRServiceInstance = new DualASRService();
  }
  return dualASRServiceInstance;
}

