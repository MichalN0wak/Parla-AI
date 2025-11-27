export const supportsMicrophone = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(navigator.mediaDevices?.getUserMedia);
};

export type MicrophoneErrorCode =
  | "permission-denied"
  | "not-found"
  | "browser-blocked"
  | "unknown";

export const resolveMicrophoneError = (error: unknown): {
  code: MicrophoneErrorCode;
  message: string;
} => {
  if (typeof window === "undefined") {
    return {
      code: "unknown",
      message: "Microphone APIs are only available in the browser.",
    };
  }

  if (error && typeof error === "object" && "name" in error) {
    const name = String(error.name);
    switch (name) {
      case "NotAllowedError":
      case "SecurityError":
        return {
          code: "permission-denied",
          message:
            "Microphone permission denied. Please enable access in your browser settings.",
        };
      case "NotFoundError":
      case "DevicesNotFoundError":
        return {
          code: "not-found",
          message:
            "No input microphone found. Connect an audio device and try again.",
        };
      case "NotReadableError":
      case "AbortError":
        return {
          code: "browser-blocked",
          message:
            "Your browser blocked microphone capture. Close other apps using the mic and retry.",
        };
      default:
        break;
    }
  }

  return {
    code: "unknown",
    message: "Unexpected microphone error. Reload and try again.",
  };
};

