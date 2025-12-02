import { ProficiencyLevel } from "@/store/useSessionStore";
import {
  createPromptConfig,
  generateInitialGreeting,
  type PromptConfig,
} from "@/lib/prompts/builder";
import { getTurnOrchestrationService } from "@/lib/ai/turnOrchestration";
import {
  getCoachingService,
  type CoachingEvent,
} from "@/lib/ai/coaching";
import type { DualLanguageTranscriptionResult } from "@/lib/transcription/types";
import {
  detectHelperPhrase,
  extractPolishVocabulary,
  type HelperPhraseDetection,
} from "@/lib/transcription/helperPhrases";

/**
 * Configuration for AI conversation service.
 */
export interface ConversationConfig {
  topic: string;
  proficiency: ProficiencyLevel;
  sessionId?: string;
}

/**
 * Represents a conversation message.
 */
export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
  transcription?: DualLanguageTranscriptionResult;
}

/**
 * Service for managing AI conversations.
 * Currently provides structure for OpenAI Realtime API integration.
 */
export class ConversationService {
  private config: ConversationConfig | null = null;
  private promptConfig: PromptConfig | null = null;
  private messages: ConversationMessage[] = [];
  private onMessage?: (message: ConversationMessage) => void;
  private coachingService = getCoachingService();

  /**
   * Initializes a new conversation session.
   * If a session already exists, it will be reset first to ensure clean state.
   */
  initialize(config: ConversationConfig): void {
    // Reset any existing session to ensure clean state
    if (this.config) {
      this.reset();
    }

    this.config = config;
    this.promptConfig = createPromptConfig(
      config.topic,
      config.proficiency,
      config.sessionId,
    );

    // Log prompt configuration for traceability
    this.logPromptConfig();
    
    // Log proficiency for verification (Story 2.3)
    if (process.env.NODE_ENV === "development") {
      console.log(`📚 Proficiency level: ${config.proficiency} - Dialogue strategies applied`);
    }

    // Initialize with system prompt
    this.messages = [
      {
        role: "system",
        content: this.promptConfig.systemPrompt,
        timestamp: Date.now(),
      },
    ];

    // Generate initial greeting
    const greeting = generateInitialGreeting(
      config.topic,
      config.proficiency,
    );
    this.addMessage("assistant", greeting);

    // Set up coaching service callbacks
    this.coachingService.setCallback((event) => {
      this.handleCoachingEvent(event);
    });
  }

  /**
   * Adds a message to the conversation.
   */
  addMessage(
    role: "user" | "assistant",
    content: string,
    transcription?: DualLanguageTranscriptionResult,
  ): void {
    const message: ConversationMessage = {
      role,
      content,
      timestamp: Date.now(),
      transcription,
    };
    this.messages.push(message);

    // Notify listeners
    if (this.onMessage) {
      this.onMessage(message);
    }
  }

  /**
   * Sets a callback for new messages.
   */
  onNewMessage(callback: (message: ConversationMessage) => void): void {
    this.onMessage = callback;
  }

  /**
   * Gets the current conversation history.
   */
  getHistory(): ConversationMessage[] {
    return [...this.messages];
  }

  /**
   * Gets the system prompt for this conversation.
   */
  getSystemPrompt(): string | null {
    return this.promptConfig?.systemPrompt ?? null;
  }

  /**
   * Gets the prompt configuration for debugging.
   */
  getPromptConfig(): PromptConfig | null {
    return this.promptConfig;
  }

  /**
   * Logs prompt configuration for traceability.
   * In production, this would send to a logging service.
   */
  private logPromptConfig(): void {
    if (!this.promptConfig) return;

    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console.group("🤖 AI Prompt Configuration");
      console.log("Topic:", this.promptConfig.topic);
      console.log("Proficiency:", this.promptConfig.proficiency);
      console.log("Generated at:", new Date(this.promptConfig.generatedAt).toISOString());
      console.log("System Prompt:", this.promptConfig.systemPrompt);
      console.groupEnd();
    }

    // TODO: In production, send to logging service or analytics
    // Example: analytics.track('prompt_config_created', this.promptConfig);
  }

  /**
   * Resets the conversation service.
   */
  reset(): void {
    this.config = null;
    this.promptConfig = null;
    this.messages = [];
    this.onMessage = undefined;
    this.coachingService.reset();
  }

  /**
   * Sends a user message and triggers AI response.
   * Integrates with turn orchestration for proper turn management.
   * Detects Polish helper phrases (Story 3.2) and handles them appropriately.
   */
  async sendUserMessage(
    content: string,
    isPolish: boolean = false,
    transcription?: DualLanguageTranscriptionResult,
  ): Promise<void> {
    const turnService = getTurnOrchestrationService();
    
    // Detect helper phrases (Story 3.2)
    // If transcription is flagged as translation request (Push-to-Ask), use that
    const tokens = transcription?.tokens ?? [];
    const helperDetection = transcription?.isTranslationRequest
      ? { intent: "translation_request" as const, extractedPhrase: content, confidence: 0.95 }
      : detectHelperPhrase(content, tokens);
    const polishVocabulary = extractPolishVocabulary(content, tokens);
    
    // Log helper phrase detection in development
    if (process.env.NODE_ENV === "development" && helperDetection.intent !== "none") {
      console.log("🔍 Helper phrase detected:", {
        intent: helperDetection.intent,
        extractedPhrase: helperDetection.extractedPhrase,
        confidence: helperDetection.confidence,
      });
    }
    
    // Analyze speech for coaching opportunities
    this.coachingService.analyzeSpeech(content, isPolish);
    this.coachingService.recordSpeech(); // Reset pause detection
    
    // Add user message
    this.addMessage("user", content, transcription);
    
    // Don't start pause detection immediately - wait a bit to see if AI responds
    // This prevents coaching messages from appearing right after user speaks (Issue #3 fix)
    // Pause detection will start after AI response completes
    
    // TODO: Integrate with OpenAI Realtime API
    // For now, simulate AI response with delay
    try {
      await this.simulateAIResponse(helperDetection, polishVocabulary);
      turnService.resetRetryCount();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("AI response failed, attempting retry", error);
      }
      // Handle network error with retry logic
      const retrySuccess = await turnService.handleNetworkError(async () => {
        await this.simulateAIResponse(helperDetection, polishVocabulary);
      });
      
      if (!retrySuccess) {
        this.addMessage("assistant", "Mi dispiace, c'è stato un errore. Puoi riprovare?");
        turnService.startUserTurn();
      }
    }
  }

  /**
   * Handles coaching events and adds supportive messages
   * Only triggers if there's no recent conversation activity (Issue #3 fix)
   */
  private handleCoachingEvent(event: CoachingEvent): void {
    // Check if we've had recent conversation activity
    // Don't show coaching messages if there's been a normal conversation response recently
    const recentMessages = this.messages.slice(-5); // Check last 5 messages
    const coachingPhrases = ["Prenditi", "Stai facendo", "Non preoccuparti", "Quando sei pronto", "Continua quando"];
    const hasRecentAIResponse = recentMessages.some(
      (m) => m.role === "assistant" && 
             !coachingPhrases.some(phrase => m.content.includes(phrase)) &&
             m.content.length > 20 // Meaningful response, not just coaching
    );
    
    // Only show coaching if there's no recent meaningful conversation
    // This prevents coaching from overriding contextual responses
    // Exception: always show frustration events (user needs help)
    if (!hasRecentAIResponse || event.type === "frustration") {
      // Add coaching message as assistant response
      this.addMessage("assistant", event.message);
      
      // Queue audio for coaching message
      const turnService = getTurnOrchestrationService();
      turnService.queueAudio(event.message);
    } else {
      // Log that coaching was suppressed due to recent conversation
      if (process.env.NODE_ENV === "development") {
        console.log("💬 Coaching suppressed - recent conversation activity");
      }
    }
  }

  /**
   * Simulates AI response (to be replaced with OpenAI Realtime API)
   * Handles helper phrase detection (Story 3.2) to provide appropriate responses.
   * Provides contextual, natural conversation flow (Issue #3 fix).
   */
  private async simulateAIResponse(
    helperDetection?: HelperPhraseDetection,
    polishVocabulary?: string[],
  ): Promise<void> {
    const turnService = getTurnOrchestrationService();
    
    // Mark that AI response has started
    turnService.aiResponseStarted();
    
    // Simulate network delay (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    // Get recent conversation context for natural responses
    const recentMessages = this.messages.slice(-4); // Last 4 messages for context
    const lastUserMessage = recentMessages
      .filter((m) => m.role === "user")
      .pop();
    
    // Generate response based on helper phrase detection (Story 3.2)
    let response: string;
    
    if (helperDetection && helperDetection.intent !== "none") {
      // Handle helper phrase requests with actual translations
      switch (helperDetection.intent) {
        case "translation_request": {
          const phrase = helperDetection.extractedPhrase || "";
          // Provide actual Italian translations for common words/phrases
          const translations: Record<string, string> = {
            bezchmurne: "senza nuvole",
            bezchmurny: "senza nuvole",
            bezchmurna: "senza nuvole",
            "lubię jeść w restauracji": "mi piace mangiare al ristorante",
            "lubię jeść": "mi piace mangiare",
            restauracji: "ristorante",
            niebo: "il cielo",
            pogoda: "il tempo",
            słońce: "il sole",
            deszcz: "la pioggia",
            śnieg: "la neve",
            wiatr: "il vento",
          };
          
          const normalizedPhrase = phrase.toLowerCase().trim();
          const translation = translations[normalizedPhrase] || 
            translations[phrase] || // Try exact match first
            (normalizedPhrase.length > 0 ? `"${normalizedPhrase}"` : "questa parola");
          
          // Topic-agnostic contextual response
          if (translation.includes("ristorante") || translation.includes("mangiare")) {
            response = `In italiano si dice "${translation}". Per esempio: "Mi piace mangiare al ristorante" o "Amo mangiare fuori".`;
          } else if (translation === "senza nuvole") {
            response = `Si dice "senza nuvole" o "sereno". Per esempio: "Il cielo è sereno" o "Il cielo è senza nuvole".`;
          } else {
            response = `In italiano si dice "${translation}". Puoi usarlo così: "[esempio con la frase]".`;
          }
          break;
        }
        case "grammar_check": {
          const phrase = helperDetection.extractedPhrase || "questa frase";
          response = `Riguardo a "${phrase}", sì, è corretto! Continua così!`;
          break;
        }
        case "vocabulary_question": {
          const word = helperDetection.extractedPhrase || "questa parola";
          response = `"${word}" significa... Dimmi di più sul contesto e ti aiuto meglio!`;
          break;
        }
        default:
          response = "Capisco la tua domanda. Come posso aiutarti?";
      }
    } else if (polishVocabulary && polishVocabulary.length > 0) {
      // Regular Polish words detected (not helper phrases)
      response = "Interessante! Continua a parlare in italiano quando puoi.";
    } else {
      // Topic-agnostic contextual responses (Issue #3 fix)
      // Works for any topic, not just weather
      const lastUserText = lastUserMessage?.content.toLowerCase() || "";
      const lastUserFull = lastUserMessage?.content || "";
      
      // Extract key nouns/entities from user's message (simple heuristic)
      const extractKeyWords = (text: string): string[] => {
        // Remove common function words and get meaningful nouns/adjectives
        const words = text
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => {
            const cleaned = w.replace(/[^a-ząćęłńóśźżàèéìíîòóù]/g, "");
            return (
              cleaned.length > 3 &&
              !["come", "quando", "dove", "perché", "cosa", "chi", "quale", "che", "è", "sono", "sei", "siamo", "ha", "hanno"].includes(cleaned)
            );
          });
        return words.slice(0, 3); // Top 3 key words
      };
      
      const keyWords = extractKeyWords(lastUserFull);
      const isQuestion = lastUserText.includes("?");
      const isShort = lastUserText.length < 15;
      const hasQuestionWord = /(?:puoi|può|posso|come|cosa|quando|dove|perché)/i.test(lastUserText);
      
      // Generate natural, topic-agnostic responses
      if (isQuestion && hasQuestionWord && lastUserText.includes("domanda")) {
        // User asked if AI can ask a question - ask something relevant to the topic
        const topic = this.config?.topic || "questo argomento";
        response = `Certo! Dimmi, cosa ti interessa di più riguardo a ${topic}?`;
      } else if (isShort) {
        // Short utterance - encourage continuation
        response = "Continua, dimmi di più!";
      } else if (keyWords.length > 0) {
        // User mentioned something specific - ask about it or related aspects
        const mainWord = keyWords[0];
        
        // Check if we've already asked about this word in recent messages
        const recentAI = this.messages
          .filter((m) => m.role === "assistant")
          .slice(-3) // Check last 3 AI messages
          .some((m) => m.content.toLowerCase().includes(mainWord));
        
        if (recentAI) {
          // Already discussed this recently - move forward
          response = `Interessante! Cosa altro vuoi dire su ${mainWord}?`;
        } else {
          // New topic - ask a follow-up question
          const followUps = [
            `Perfetto! Dimmi di più su ${mainWord}.`,
            `Interessante! Cosa ti piace di ${mainWord}?`,
            `Sì, ${mainWord}! Cosa ne pensi?`,
            `Va bene! Come descriveresti ${mainWord}?`,
          ];
          response = followUps[Math.floor(Math.random() * followUps.length)];
        }
      } else {
        // Generic but engaging follow-up that references the topic
        const topic = this.config?.topic || "questo argomento";
        const genericResponses = [
          `Interessante! Dimmi di più su ${topic}.`,
          "Capisco. Cosa ne pensi?",
          "Va bene! E poi?",
          "Sì, continua!",
          `Perfetto! Cosa altro vuoi dire su ${topic}?`,
        ];
        response = genericResponses[
          Math.floor(Math.random() * genericResponses.length)
        ];
      }
    }
    
    // Add AI message
    this.addMessage("assistant", response);
    
    // Queue audio for playback
    turnService.queueAudio(response);
    
    // Start pause detection after AI response (not immediately after user speaks)
    // This prevents coaching from interfering with normal conversation flow
    this.coachingService.recordSpeechEnd();
  }
}

/**
 * Singleton instance of the conversation service.
 */
let conversationServiceInstance: ConversationService | null = null;

/**
 * Gets or creates the conversation service instance.
 */
export function getConversationService(): ConversationService {
  if (!conversationServiceInstance) {
    conversationServiceInstance = new ConversationService();
  }
  return conversationServiceInstance;
}

