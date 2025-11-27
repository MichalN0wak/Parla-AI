/**
 * Session summary service for generating post-session narratives.
 * Provides highlights, suggested topics, and encouraging feedback.
 */

import { ProficiencyLevel } from "@/store/useSessionStore";
import type { ConversationMessage } from "@/lib/ai/conversation";

export interface SessionSummary {
  highlights: string[];
  suggestedNextTopic: string;
  sessionDuration: number; // milliseconds
  messageCount: number;
  isShortSession: boolean;
  summaryText: string;
  generatedAt: number;
}

export interface SummaryConfig {
  shortSessionThreshold: number; // milliseconds - when to consider session "short"
  minHighlights: number;
  maxHighlights: number;
}

const DEFAULT_CONFIG: SummaryConfig = {
  shortSessionThreshold: 120000, // 2 minutes
  minHighlights: 2,
  maxHighlights: 3,
};

/**
 * Suggested topics based on common conversation themes
 */
const SUGGESTED_TOPICS: Record<ProficiencyLevel, string[]> = {
  A2: [
    "la tua routine quotidiana",
    "i tuoi hobby",
    "il cibo italiano",
    "i viaggi",
    "la famiglia",
  ],
  B1: [
    "il lavoro e la carriera",
    "la cultura italiana",
    "i film e la musica",
    "le tradizioni",
    "le esperienze personali",
  ],
  B2: [
    "l'attualità e la politica",
    "la letteratura italiana",
    "le sfide professionali",
    "le opinioni personali",
    "i dibattiti culturali",
  ],
};

/**
 * Session summary service
 */
export class SessionSummaryService {
  private config: SummaryConfig;

  constructor(config: Partial<SummaryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generates a session summary from conversation history
   */
  generateSummary(
    messages: ConversationMessage[],
    topic: string,
    proficiency: ProficiencyLevel,
    sessionStartTime: number,
  ): SessionSummary {
    const sessionDuration = Date.now() - sessionStartTime;
    const isShortSession = sessionDuration < this.config.shortSessionThreshold;
    const userMessages = messages.filter((msg) => msg.role === "user");
    const aiMessages = messages.filter((msg) => msg.role === "assistant");

    // Generate highlights
    const highlights = this.generateHighlights(
      userMessages,
      aiMessages,
      isShortSession,
    );

    // Generate suggested next topic
    const suggestedNextTopic = this.generateSuggestedTopic(
      topic,
      proficiency,
    );

    // Generate summary text
    const summaryText = this.generateSummaryText(
      highlights,
      suggestedNextTopic,
      isShortSession,
      sessionDuration,
    );

    return {
      highlights,
      suggestedNextTopic,
      sessionDuration,
      messageCount: messages.length,
      isShortSession,
      summaryText,
      generatedAt: Date.now(),
    };
  }

  /**
   * Generates highlights from conversation
   */
  private generateHighlights(
    userMessages: ConversationMessage[],
    aiMessages: ConversationMessage[],
    isShortSession: boolean,
  ): string[] {
    const highlights: string[] = [];

    // If short session, add encouraging message
    if (isShortSession) {
      highlights.push(
        "Hai iniziato bene! Prova a praticare un po' più a lungo la prossima volta.",
      );
    }

    // Analyze conversation for positive points
    if (userMessages.length > 0) {
      highlights.push(
        `Hai fatto ${userMessages.length} intervento${userMessages.length > 1 ? "i" : ""} durante la conversazione. Ottimo!`,
      );
    }

    // Check for vocabulary usage
    const hasVocabulary = userMessages.some((msg) => {
      const text = msg.content.toLowerCase();
      return text.length > 20; // Simple heuristic: longer messages suggest vocabulary usage
    });

    if (hasVocabulary) {
      highlights.push(
        "Hai usato un buon vocabolario durante la conversazione.",
      );
    }

    // Check for engagement
    if (aiMessages.length > 2) {
      highlights.push(
        "Hai mantenuto una buona interazione con l'AI durante la sessione.",
      );
    }

    // Ensure we have at least minHighlights
    while (highlights.length < this.config.minHighlights) {
      highlights.push(
        "Continua a praticare regolarmente per migliorare la tua fluidità.",
      );
    }

    // Limit to maxHighlights
    return highlights.slice(0, this.config.maxHighlights);
  }

  /**
   * Generates a suggested next topic
   */
  private generateSuggestedTopic(
    currentTopic: string,
    proficiency: ProficiencyLevel,
  ): string {
    const topics = SUGGESTED_TOPICS[proficiency];
    
    // Try to suggest a different topic
    const currentLower = currentTopic.toLowerCase();
    const differentTopics = topics.filter(
      (topic) => !currentLower.includes(topic.toLowerCase()) &&
        !topic.toLowerCase().includes(currentLower),
    );

    if (differentTopics.length > 0) {
      return differentTopics[
        Math.floor(Math.random() * differentTopics.length)
      ];
    }

    // Fallback to random topic
    return topics[Math.floor(Math.random() * topics.length)];
  }

  /**
   * Generates the full summary text
   */
  private generateSummaryText(
    highlights: string[],
    suggestedNextTopic: string,
    isShortSession: boolean,
    sessionDuration: number,
  ): string {
    const durationMinutes = Math.floor(sessionDuration / 60000);
    const durationSeconds = Math.floor((sessionDuration % 60000) / 1000);

    let summary = `Ottimo lavoro! Hai praticato per ${durationMinutes} minuto${durationMinutes !== 1 ? "i" : ""} e ${durationSeconds} secondo${durationSeconds !== 1 ? "i" : ""}.\n\n`;

    if (isShortSession) {
      summary +=
        "Questa è stata una sessione breve. La prossima volta, prova a praticare un po' più a lungo per ottenere maggiori benefici!\n\n";
    }

    summary += "Ecco alcuni punti salienti:\n";
    highlights.forEach((highlight, index) => {
      summary += `• ${highlight}\n`;
    });

    summary += `\nProssimo argomento suggerito: "${suggestedNextTopic}"\n\n`;
    summary += "Continua a praticare regolarmente per migliorare la tua fluidità in italiano!";

    return summary;
  }
}

/**
 * Singleton instance
 */
let sessionSummaryInstance: SessionSummaryService | null = null;

/**
 * Gets or creates the session summary service instance
 */
export function getSessionSummaryService(): SessionSummaryService {
  if (!sessionSummaryInstance) {
    sessionSummaryInstance = new SessionSummaryService();
  }
  return sessionSummaryInstance;
}

