import { useState, useRef, useCallback } from "react";

export interface SpeechRecognitionHook {
  isRecording: boolean;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  transcript: string;
  clearTranscript: () => void;
  error: string | null;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const checkSupport = useCallback(() => {
    const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;
    const hasSpeechRecognition = "SpeechRecognition" in window;
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    return (hasWebkitSpeechRecognition || hasSpeechRecognition) && isSecure;
  }, []);

  const initializeRecognition = useCallback(() => {
    if (!checkSupport()) {
      setIsSupported(false);
      return null;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);

      switch (event.error) {
        case "not-allowed":
          setError(
            "Microphone access denied. Please allow microphone access and try again."
          );
          break;
        case "audio-capture":
          setError(
            "Microphone not available. Please check your microphone connection."
          );
          break;
        case "network":
          setError("Network error. Please check your internet connection.");
          break;
        case "no-speech":
          // Don't treat no-speech as an error
          break;
        case "aborted":
          // User-initiated abort, not an error
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    setIsSupported(true);
    return recognition;
  }, [checkSupport]);

  const startRecording = useCallback(async () => {
    try {
      // Check microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }

      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        throw new Error("Speech recognition not available");
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
      } else if (err.name === "NotFoundError") {
        setError(
          "No microphone detected. Please connect a microphone and try again."
        );
      } else if (err.name === "NotReadableError") {
        setError(
          "Microphone is being used by another application. Please close other apps and try again."
        );
      } else {
        setError(err.message || "Unable to start voice recording");
      }
    }
  }, [initializeRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    transcript,
    clearTranscript,
    error,
  };
};
