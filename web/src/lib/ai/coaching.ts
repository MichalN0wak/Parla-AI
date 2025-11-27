/**
 * Coaching service for providing supportive feedback and confidence cues.
 * Detects pauses, frustration, and repeated Polish usage to offer encouragement.
 */

export interface CoachingEvent {
  type: "pause" | "frustration" | "repeated_polish" | "encouragement";
  message: string;
  timestamp: number;
}

export interface CoachingConfig {
  pauseThreshold: number; // ms - when to consider a pause "long"
  polishRepetitionThreshold: number; // number of Polish words in recent speech
  pausePromptDelay: number; // ms - delay before offering prompt after pause
}

const DEFAULT_CONFIG: CoachingConfig = {
  pauseThreshold: 4000, // 4 seconds
  polishRepetitionThreshold: 3, // 3+ Polish words in recent speech
  pausePromptDelay: 1000, // 1 second after pause threshold
};

/**
 * Polish frustration keywords and phrases
 */
const FRUSTRATION_KEYWORDS = [
  "nie wiem",
  "nie wiem jak",
  "nie rozumiem",
  "nie mogę",
  "trudne",
  "nie pamiętam",
  "zapomniałem",
  "zapomniałam",
  "jak powiedzieć",
  "jak się mówi",
  "nie umiem",
];

/**
 * Supportive coaching responses
 */
const COACHING_RESPONSES = {
  pause: [
    "Prenditi il tuo tempo, non c'è fretta.",
    "Stai facendo bene! Continua quando sei pronto.",
    "Non preoccuparti, pensa con calma.",
    "Quando sei pronto, continua pure.",
  ],
  frustration: [
    "Capisco, è normale sentirsi così. Ecco come si dice: [PHRASE]. Continua così, stai facendo progressi!",
    "Non ti preoccupare! La frase corretta è: [PHRASE]. Stai migliorando!",
    "È comprensibile! In italiano si dice: [PHRASE]. Continua a praticare!",
  ],
  repeatedPolish: [
    "Vedo che stai usando alcune parole polacche - va benissimo! Ricorda che in italiano si dice: [PHRASE]. Continua così!",
    "Hai fatto un buon tentativo! La traduzione italiana è: [PHRASE]. Stai facendo progressi!",
    "Non c'è problema se usi il polacco quando non ricordi una parola. In italiano: [PHRASE]. Continua a praticare!",
  ],
  encouragement: [
    "Stai facendo molto bene! Continua così.",
    "Ottimo lavoro! Stai migliorando.",
    "Bravo! Continua a parlare, stai facendo progressi.",
  ],
};

/**
 * Coaching service for detecting and responding to learner needs
 */
export class CoachingService {
  private config: CoachingConfig;
  private lastSpeechTime: number = 0;
  private pauseTimeoutId?: NodeJS.Timeout;
  private recentPolishWords: string[] = [];
  private onCoachingEvent?: (event: CoachingEvent) => void;

  constructor(config: Partial<CoachingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Sets callback for coaching events
   */
  setCallback(callback: (event: CoachingEvent) => void): void {
    this.onCoachingEvent = callback;
  }

  /**
   * Records that user has spoken (resets pause detection)
   */
  recordSpeech(): void {
    this.lastSpeechTime = Date.now();
    this.clearPauseTimeout();
  }

  /**
   * Records that user has stopped speaking (starts pause detection)
   */
  recordSpeechEnd(): void {
    this.clearPauseTimeout();
    
    // Start pause detection
    this.pauseTimeoutId = setTimeout(() => {
      this.handleLongPause();
    }, this.config.pauseThreshold + this.config.pausePromptDelay);
  }

  /**
   * Detects frustration keywords in user speech
   */
  detectFrustration(text: string): boolean {
    const lowerText = text.toLowerCase();
    return FRUSTRATION_KEYWORDS.some((keyword) =>
      lowerText.includes(keyword.toLowerCase()),
    );
  }

  /**
   * Records Polish words detected in speech
   */
  recordPolishWord(word: string): void {
    this.recentPolishWords.push(word);
    
    // Keep only recent Polish words (last 10)
    if (this.recentPolishWords.length > 10) {
      this.recentPolishWords = this.recentPolishWords.slice(-10);
    }

    // Check if we've hit the repetition threshold
    if (this.recentPolishWords.length >= this.config.polishRepetitionThreshold) {
      this.handleRepeatedPolish();
    }
  }

  /**
   * Analyzes user speech for coaching opportunities
   */
  analyzeSpeech(text: string, isPolish: boolean = false): void {
    if (isPolish) {
      this.recordPolishWord(text);
    }

    if (this.detectFrustration(text)) {
      this.handleFrustration(text);
    }
  }

  /**
   * Handles long pause detection
   */
  private handleLongPause(): void {
    const response =
      COACHING_RESPONSES.pause[
        Math.floor(Math.random() * COACHING_RESPONSES.pause.length)
      ];

    this.emitEvent({
      type: "pause",
      message: response,
      timestamp: Date.now(),
    });
  }

  /**
   * Handles frustration detection
   */
  private handleFrustration(text: string): void {
    // Extract the phrase the user is asking about (if any)
    const phraseMatch = text.match(/jak (?:się )?mówi (.+)/i);
    const phrase = phraseMatch ? phraseMatch[1] : "questa cosa";

    const response =
      COACHING_RESPONSES.frustration[
        Math.floor(Math.random() * COACHING_RESPONSES.frustration.length)
      ].replace("[PHRASE]", phrase);

    this.emitEvent({
      type: "frustration",
      message: response,
      timestamp: Date.now(),
    });
  }

  /**
   * Handles repeated Polish usage
   */
  private handleRepeatedPolish(): void {
    // Get the most recent Polish words
    const recentWords = this.recentPolishWords.slice(-3).join(" ");

    const response =
      COACHING_RESPONSES.repeatedPolish[
        Math.floor(Math.random() * COACHING_RESPONSES.repeatedPolish.length)
      ].replace("[PHRASE]", recentWords);

    this.emitEvent({
      type: "repeated_polish",
      message: response,
      timestamp: Date.now(),
    });

    // Reset counter after handling
    this.recentPolishWords = [];
  }

  /**
   * Emits a coaching event
   */
  private emitEvent(event: CoachingEvent): void {
    if (this.onCoachingEvent) {
      this.onCoachingEvent(event);
    }

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`💬 Coaching event: ${event.type}`, event.message);
    }
  }

  /**
   * Clears pause timeout
   */
  private clearPauseTimeout(): void {
    if (this.pauseTimeoutId) {
      clearTimeout(this.pauseTimeoutId);
      this.pauseTimeoutId = undefined;
    }
  }

  /**
   * Resets the coaching service
   */
  reset(): void {
    this.clearPauseTimeout();
    this.lastSpeechTime = 0;
    this.recentPolishWords = [];
    this.onCoachingEvent = undefined;
  }

  /**
   * Test method: Manually trigger a coaching event (for testing)
   */
  testTrigger(eventType: "pause" | "frustration" | "repeated_polish"): void {
    switch (eventType) {
      case "pause":
        this.handleLongPause();
        break;
      case "frustration":
        this.handleFrustration("Nie wiem jak powiedzieć ciao");
        break;
      case "repeated_polish":
        // Simulate repeated Polish words
        for (let i = 0; i < this.config.polishRepetitionThreshold; i++) {
          this.recordPolishWord("test");
        }
        break;
    }
  }
}

/**
 * Singleton instance
 */
let coachingServiceInstance: CoachingService | null = null;

/**
 * Gets or creates the coaching service instance
 */
export function getCoachingService(): CoachingService {
  if (!coachingServiceInstance) {
    coachingServiceInstance = new CoachingService();
  }
  return coachingServiceInstance;
}

