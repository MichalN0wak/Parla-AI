/**
 * React hook for Push-to-Ask functionality
 * 
 * Manages button/keyboard state and coordinates with DualASRService
 * to switch between Italian and Polish recognition modes.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getDualASRService } from "@/lib/transcription/dualASRService";
import type { ASRMode } from "@/lib/transcription/dualASRService";

export interface UsePushToAskReturn {
  isPolishMode: boolean;
  isSwitching: boolean;
  startPolishMode: () => Promise<void>;
  endPolishMode: () => Promise<void>;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleKeyUp: (event: React.KeyboardEvent) => void;
}

/**
 * Hook for managing Push-to-Ask functionality
 * 
 * @param enabled - Whether Push-to-Ask is enabled (default: true)
 * @param keyboardShortcut - Keyboard key to use (default: 'Space')
 * @returns Object with state and handlers
 */
export function usePushToAsk(
  enabled: boolean = true,
  keyboardShortcut: string = "Space",
): UsePushToAskReturn {
  const [isPolishMode, setIsPolishMode] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const isKeyPressedRef = useRef(false);
  const dualASRService = getDualASRService();

  // Listen for mode changes from the service
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleModeChange = (mode: ASRMode) => {
      setIsPolishMode(mode === "polish");
      setIsSwitching(mode === "switching");
    };

    dualASRService.setCallbacks({
      onModeChange: handleModeChange,
    });

    // Get initial mode (use callback to avoid setState in effect)
    const updateMode = () => {
      const currentMode = dualASRService.getMode();
      setIsPolishMode(currentMode === "polish");
      setIsSwitching(currentMode === "switching");
    };
    
    // Initial mode check
    updateMode();
  }, [enabled, dualASRService]);

  // Start Polish mode (called when button is pressed or Spacebar is held)
  const startPolishMode = useCallback(async () => {
    if (!enabled || isSwitching || isPolishMode) {
      return;
    }

    try {
      setIsSwitching(true);
      await dualASRService.switchToPolish();
    } catch (error) {
      console.error("Failed to switch to Polish mode:", error);
      setIsSwitching(false);
    }
  }, [enabled, isSwitching, isPolishMode, dualASRService]);

  // End Polish mode (called when button is released or Spacebar is released)
  const endPolishMode = useCallback(async () => {
    if (!enabled || isSwitching || !isPolishMode) {
      return;
    }

    try {
      setIsSwitching(true);
      await dualASRService.switchToItalian();
    } catch (error) {
      console.error("Failed to switch to Italian mode:", error);
      setIsSwitching(false);
    }
  }, [enabled, isSwitching, isPolishMode, dualASRService]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      // Only handle the configured shortcut key
      if (event.code !== keyboardShortcut && event.key !== keyboardShortcut) {
        return;
      }

      // Prevent default behavior (scrolling on Spacebar)
      event.preventDefault();

      // Only start if not already pressed (debounce)
      if (!isKeyPressedRef.current) {
        isKeyPressedRef.current = true;
        void startPolishMode();
      }
    },
    [enabled, keyboardShortcut, startPolishMode],
  );

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      // Only handle the configured shortcut key
      if (event.code !== keyboardShortcut && event.key !== keyboardShortcut) {
        return;
      }

      // Prevent default behavior
      event.preventDefault();

      // Only end if key was pressed
      if (isKeyPressedRef.current) {
        isKeyPressedRef.current = false;
        void endPolishMode();
      }
    },
    [enabled, keyboardShortcut, endPolishMode],
  );

  // Global keyboard event listeners (for when focus is not on a specific element)
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.code === keyboardShortcut || event.key === keyboardShortcut) {
        event.preventDefault();
        if (!isKeyPressedRef.current) {
          isKeyPressedRef.current = true;
          void startPolishMode();
        }
      }
    };

    const handleGlobalKeyUp = (event: KeyboardEvent) => {
      if (event.code === keyboardShortcut || event.key === keyboardShortcut) {
        event.preventDefault();
        if (isKeyPressedRef.current) {
          isKeyPressedRef.current = false;
          void endPolishMode();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("keyup", handleGlobalKeyUp);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, [enabled, keyboardShortcut, startPolishMode, endPolishMode]);

  return {
    isPolishMode,
    isSwitching,
    startPolishMode,
    endPolishMode,
    handleKeyDown,
    handleKeyUp,
  };
}

