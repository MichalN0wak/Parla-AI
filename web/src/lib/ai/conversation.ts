import { ProficiencyLevel } from "@/store/useSessionStore";
import {
  buildSystemPrompt,
  createPromptConfig,
  generateInitialGreeting,
  type PromptConfig,
} from "@/lib/prompts/builder";

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

  /**
   * Initializes a new conversation session.
   */
  initialize(config: ConversationConfig): void {
    this.config = config;
    this.promptConfig = createPromptConfig(
      config.topic,
      config.proficiency,
      config.sessionId,
    );

    // Log prompt configuration for traceability
    this.logPromptConfig();

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
  }

  /**
   * TODO: Integrate with OpenAI Realtime API
   * This method will handle streaming responses from OpenAI.
   */
  async sendUserMessage(content: string): Promise<void> {
    // For now, this is a placeholder
    // In Story 2.2, this will integrate with OpenAI Realtime API
    this.addMessage("user", content);
    
    // Mock response for development
    if (process.env.NODE_ENV === "development") {
      console.log("📤 User message sent (mock):", content);
      console.log("⏳ Waiting for AI response... (to be implemented in Story 2.2)");
    }
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

