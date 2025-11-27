"use client";

import { useCallback, useEffect } from "react";
import { resolveMicrophoneError, supportsMicrophone } from "@/lib/audio/support";
import { useVoiceStore } from "@/store/useVoiceStore";

const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    channelCount: 1,
    sampleRate: 44100,
    noiseSuppression: true,
    echoCancellation: true,
  },
  video: false,
};

export function useMicrophoneController() {
  const micPhase = useVoiceStore((state) => state.micPhase);
  const permission = useVoiceStore((state) => state.permission);
  const mediaStream = useVoiceStore((state) => state.mediaStream);
  const { actions } = useVoiceStore.getState();

  const cleanupStream = useCallback(() => {
    const stream = useVoiceStore.getState().mediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    actions.attachStream(null);
  }, [actions]);

  const ensureSupport = useCallback(() => {
    if (!supportsMicrophone()) {
      actions.markUnsupported();
      return false;
    }
    return true;
  }, [actions]);

  useEffect(() => {
    ensureSupport();
    return () => cleanupStream();
  }, [cleanupStream, ensureSupport]);

  const requestAccess = useCallback(async () => {
    if (!ensureSupport()) {
      return;
    }

    if (permission === "granted" && mediaStream) {
      actions.setPhase("ready");
      return;
    }

    try {
      actions.setPhase("requesting");
      const stream = await navigator.mediaDevices.getUserMedia(
        AUDIO_CONSTRAINTS,
      );
      actions.attachStream(stream);
      actions.setPermission("granted");
      actions.setError(undefined);
      actions.setPhase("ready");
    } catch (error) {
      const { message } = resolveMicrophoneError(error);
      actions.setPermission("denied");
      actions.setError(message);
    }
  }, [actions, ensureSupport, mediaStream, permission]);

  const startRecording = useCallback(async () => {
    if (micPhase === "unsupported") {
      return;
    }
    if (micPhase === "recording") {
      return;
    }

    if (permission !== "granted" || !mediaStream) {
      await requestAccess();
    }

    if (useVoiceStore.getState().permission !== "granted") {
      return;
    }

    actions.setPhase("recording");
    actions.setError(undefined);
  }, [actions, mediaStream, micPhase, permission, requestAccess]);

  const stopRecording = useCallback(() => {
    cleanupStream();
    if (useVoiceStore.getState().permission === "granted") {
      actions.setPhase("ready");
      return;
    }
    actions.setPhase("idle");
  }, [actions, cleanupStream]);

  return {
    micPhase,
    permission,
    isRecording: micPhase === "recording",
    startRecording,
    stopRecording,
    requestAccess,
  };
}

