import { ProficiencyLevel } from "@/store/useSessionStore";
import {
  buildSystemPrompt,
  createPromptConfig,
  generateInitialGreeting,
  type PromptConfig,
} from "@/lib/prompts/builder";
import {
  getTurnOrchestrationService,
  type TurnStatus,
} from "@/lib/ai/turnOrchestration";
import {
  getCoachingService,
  type CoachingEvent,
} from "@/lib/ai/coaching";

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
  addMessage(role: "user" | "assistant", content: string): void {
    const message: ConversationMessage = {
      role,
      content,
      timestamp: Date.now(),
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
   */
  async sendUserMessage(content: string, isPolish: boolean = false): Promise<void> {
    const turnService = getTurnOrchestrationService();
    
    // Analyze speech for coaching opportunities
    this.coachingService.analyzeSpeech(content, isPolish);
    this.coachingService.recordSpeech(); // Reset pause detection
    
    // Add user message
    this.addMessage("user", content);
    
    // Mark that user finished speaking
    turnService.userFinishedSpeaking();
    this.coachingService.recordSpeechEnd(); // Start pause detection
    
    // TODO: Integrate with OpenAI Realtime API
    // For now, simulate AI response with delay
    try {
      await this.simulateAIResponse(content);
      turnService.resetRetryCount();
    } catch (error) {
      // Handle network error with retry logic
      const retrySuccess = await turnService.handleNetworkError(async () => {
        await this.simulateAIResponse(content);
      });
      
      if (!retrySuccess) {
        this.addMessage("assistant", "Mi dispiace, c'è stato un errore. Puoi riprovare?");
        turnService.startUserTurn();
      }
    }
  }

  /**
   * Handles coaching events and adds supportive messages
   */
  private handleCoachingEvent(event: CoachingEvent): void {
    // Add coaching message as assistant response
    this.addMessage("assistant", event.message);
    
    // Queue audio for coaching message
    const turnService = getTurnOrchestrationService();
    turnService.queueAudio(event.message);
  }

  /**
   * Simulates AI response (to be replaced with OpenAI Realtime API)
   */
  private async simulateAIResponse(userMessage: string): Promise<void> {
    const turnService = getTurnOrchestrationService();
    
    // Mark that AI response has started
    turnService.aiResponseStarted();
    
    // Simulate network delay (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    // Generate mock response
    const mockResponses = [
      "Interessante! Dimmi di più.",
      "Capisco. Cosa ne pensi?",
      "Perfetto! Continua a parlare.",
      "Sì, è un buon punto. E poi?",
    ];
    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    // Add AI message
    this.addMessage("assistant", response);
    
    // Queue audio for playback
    turnService.queueAudio(response);
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

