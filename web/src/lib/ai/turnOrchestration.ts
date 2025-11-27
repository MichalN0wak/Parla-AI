/**
 * Turn orchestration service for managing conversation turns between user and AI.
 * Handles status transitions, latency safeguards, and audio playback coordination.
 */

export type TurnStatus =
  | "idle"
  | "user_turn" // User can speak
  | "ai_thinking" // AI is processing (waiting for response)
  | "ai_speaking" // AI is speaking (audio playback)
  | "error"; // Error state

export interface TurnState {
  status: TurnStatus;
  aiResponseStartTime?: number;
  latencyTimeoutId?: NodeJS.Timeout;
  audioPlaybackEndTime?: number;
}

/**
 * Callbacks for turn state changes
 */
export interface TurnCallbacks {
  onStatusChange?: (status: TurnStatus) => void;
  onLatencyWarning?: () => void; // Called when latency exceeds threshold
  onTurnReady?: () => void; // Called when user's turn is ready
}

/**
 * Configuration for turn orchestration
 */
export interface TurnConfig {
  latencyWarningThreshold: number; // ms - when to show "Still thinking..."
  turnTransitionDelay: number; // ms - delay before switching to user turn after AI speaks
  maxRetries: number; // Maximum retry attempts for network errors
  retryDelay: number; // ms - delay between retries
}

const DEFAULT_CONFIG: TurnConfig = {
  latencyWarningThreshold: 3000, // 3 seconds
  turnTransitionDelay: 300, // 300ms as per acceptance criteria
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Turn orchestration service
 */
export class TurnOrchestrationService {
  private state: TurnState = { status: "idle" };
  private config: TurnConfig;
  private callbacks: TurnCallbacks = {};
  private audioQueue: Array<{ text: string; audioUrl?: string }> = [];
  private isPlayingAudio = false;
  private retryCount = 0;

  constructor(config: Partial<TurnConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Sets callbacks for turn state changes
   */
  setCallbacks(callbacks: TurnCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Gets the current turn status
   */
  getStatus(): TurnStatus {
    return this.state.status;
  }

  /**
   * Starts user's turn - user can now speak
   */
  startUserTurn(): void {
    this.clearTimeouts();
    this.setState("user_turn");
  }

  /**
   * Marks that user has finished speaking and AI should respond
   */
  userFinishedSpeaking(): void {
    this.clearTimeouts();
    this.setState("ai_thinking");
    this.state.aiResponseStartTime = Date.now();

    // Set up latency warning timeout
    this.state.latencyTimeoutId = setTimeout(() => {
      if (this.state.status === "ai_thinking") {
        this.callbacks.onLatencyWarning?.();
      }
    }, this.config.latencyWarningThreshold);
  }

  /**
   * Marks that AI response has started (streaming begins)
   */
  aiResponseStarted(): void {
    this.clearTimeouts();
    // Keep status as ai_thinking until audio playback starts
    this.state.aiResponseStartTime = Date.now();
  }

  /**
   * Marks that AI audio playback has started
   */
  aiAudioStarted(audioDuration?: number): void {
    this.clearTimeouts();
    this.setState("ai_speaking");

    // Calculate when audio will end
    if (audioDuration) {
      this.state.audioPlaybackEndTime = Date.now() + audioDuration;
      
      // Debug log in development
      if (process.env.NODE_ENV === "development") {
        console.log(`🔊 AI audio started, duration: ${(audioDuration / 1000).toFixed(1)}s`);
      }
    }
  }

  /**
   * Marks that AI audio playback has ended
   * Automatically transitions to user turn after configured delay
   */
  aiAudioEnded(): void {
    if (this.state.status !== "ai_speaking") return;

    this.clearTimeouts();

    // Transition to user turn after short delay (<300ms per acceptance criteria)
    setTimeout(() => {
      this.startUserTurn();
      this.callbacks.onTurnReady?.();
      
      // Debug log in development
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 Turn transition: AI speaking → Your turn");
      }
    }, this.config.turnTransitionDelay);
  }

  /**
   * Handles network error and retries
   */
  async handleNetworkError(
    retryFn: () => Promise<void>,
  ): Promise<boolean> {
    if (this.retryCount >= this.config.maxRetries) {
      this.setState("error");
      return false;
    }

    this.retryCount++;
    
    // Wait before retrying
    await new Promise((resolve) =>
      setTimeout(resolve, this.config.retryDelay * this.retryCount),
    );

    try {
      await retryFn();
      this.retryCount = 0; // Reset on success
      return true;
    } catch (error) {
      // Will retry again if count allows
      return this.handleNetworkError(retryFn);
    }
  }

  /**
   * Resets retry count (call after successful response)
   */
  resetRetryCount(): void {
    this.retryCount = 0;
  }

  /**
   * Queues audio for playback
   */
  queueAudio(text: string, audioUrl?: string): void {
    this.audioQueue.push({ text, audioUrl });
    this.processAudioQueue();
  }

  /**
   * Processes the audio queue
   */
  private async processAudioQueue(): Promise<void> {
    if (this.isPlayingAudio || this.audioQueue.length === 0) return;

    this.isPlayingAudio = true;
    const { text, audioUrl } = this.audioQueue.shift()!;

    if (audioUrl) {
      // Play audio file
      const audio = new Audio(audioUrl);
      
      // Mark AI audio as started - use duration if available, otherwise estimate
      const duration = audio.duration && isFinite(audio.duration)
        ? audio.duration * 1000 // Convert to milliseconds
        : text.length * 80; // Fallback estimate
      this.aiAudioStarted(duration);
      
      audio.onended = () => {
        this.isPlayingAudio = false;
        this.aiAudioEnded();
        this.processAudioQueue(); // Process next in queue
      };
      audio.onerror = () => {
        this.isPlayingAudio = false;
        // Fallback: treat as if audio ended immediately
        this.aiAudioEnded();
        this.processAudioQueue();
      };
      await audio.play();
    } else {
      // No audio URL - simulate audio duration based on text length
      // Estimate: ~150 words per minute = ~2.5 words per second
      // Average Italian word length: ~5 characters
      // So: text.length / 5 / 2.5 * 1000 = text.length * 80ms
      const estimatedDuration = Math.max(text.length * 80, 1000); // At least 1 second
      this.aiAudioStarted(estimatedDuration);

      // Simulate audio playback
      setTimeout(() => {
        this.isPlayingAudio = false;
        this.aiAudioEnded();
        this.processAudioQueue();
      }, estimatedDuration);
    }
  }

  /**
   * Sets the turn state and notifies callbacks
   */
  private setState(status: TurnStatus): void {
    if (this.state.status === status) return;

    this.state.status = status;
    this.callbacks.onStatusChange?.(status);
  }

  /**
   * Clears all active timeouts
   */
  private clearTimeouts(): void {
    if (this.state.latencyTimeoutId) {
      clearTimeout(this.state.latencyTimeoutId);
      this.state.latencyTimeoutId = undefined;
    }
  }

  /**
   * Resets the turn orchestration service
   */
  reset(): void {
    this.clearTimeouts();
    this.state = { status: "idle" };
    this.audioQueue = [];
    this.isPlayingAudio = false;
    this.retryCount = 0;
  }
}

/**
 * Singleton instance
 */
let turnOrchestrationInstance: TurnOrchestrationService | null = null;

/**
 * Gets or creates the turn orchestration service instance
 */
export function getTurnOrchestrationService(): TurnOrchestrationService {
  if (!turnOrchestrationInstance) {
    turnOrchestrationInstance = new TurnOrchestrationService();
  }
  return turnOrchestrationInstance;
}

