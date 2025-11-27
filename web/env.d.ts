export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NEXT_PUBLIC_APP_ENV?: "local" | "preview" | "production";
      readonly NEXT_PUBLIC_API_BASE_URL?: string;
      readonly OPENAI_API_KEY?: string;
      readonly SPEECH_PROVIDER_API_KEY?: string;
    }
  }
}

