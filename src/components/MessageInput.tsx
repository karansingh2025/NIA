import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, HelpCircle, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { MicrophoneTest } from "./MicrophoneTest";
import { TroubleshootingGuide } from "./TroubleshootingGuide";
import { useMonochrome } from "../context/MonochromeContext";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
  hideMicButton?: boolean;
}

export const MessageInput = ({
  onSendMessage,
  onRecordingChange,
  hideMicButton = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [lastTranscriptLength, setLastTranscriptLength] = useState(0);
  const [showMicTest, setShowMicTest] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { isMonochrome, toggleMonochrome } = useMonochrome();

  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      // Check if we're in Brave browser
      const isBrave =
        (navigator as any).brave &&
        (await (navigator as any).brave.isBrave?.());

      // Check if speech recognition is supported
      const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;
      const hasSpeechRecognition = "SpeechRecognition" in window;

      if (!hasWebkitSpeechRecognition && !hasSpeechRecognition) {
        console.warn("Speech recognition not supported in this browser");
        setIsSpeechSupported(false);

        if (isBrave) {
          toast({
            title: "Brave Browser Detected",
            description:
              "Speech recognition is disabled by default in Brave. Please switch to Chrome or enable it in Brave settings.",
            variant: "destructive",
          });
        }
        return;
      }

      // Check if we're on HTTPS or localhost (required for speech recognition)
      const isSecure =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isSecure) {
        console.warn("Speech recognition requires HTTPS or localhost");
        setIsSpeechSupported(false);
        return;
      }

      try {
        const SpeechRecognition =
          (window as any).webkitSpeechRecognition ||
          (window as any).SpeechRecognition;

        if (!SpeechRecognition) {
          console.warn("Speech recognition constructor not available");
          setIsSpeechSupported(false);

          if (isBrave) {
            toast({
              title: "Brave Browser Limitation",
              description:
                "Speech recognition is blocked by Brave's privacy settings. Please use Chrome or configure Brave to allow speech APIs.",
              variant: "destructive",
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTroubleshooting(true)}
                >
                  Fix Guide
                </Button>
              ),
            });
          }
          return;
        }

        const recognitionInstance = new SpeechRecognition();

        // Configure recognition settings with better reliability
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false; // Disable interim results for better reliability
        recognitionInstance.lang = "en-US";
        recognitionInstance.maxAlternatives = 1;

        // Add some additional properties for better reliability
        if ("serviceURI" in recognitionInstance) {
          // Some browsers support setting a custom service URI
          recognitionInstance.serviceURI = "";
        }

        recognitionInstance.onstart = () => {
          console.log("Speech recognition started");
          setIsRecording(true);
          try {
            onRecordingChange?.(true);
          } catch {}
          setLastTranscriptLength(0);
        };

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }

          // Only add new transcript content to avoid duplication
          if (
            finalTranscript.trim() &&
            finalTranscript.length > lastTranscriptLength
          ) {
            const newContent = finalTranscript.substring(lastTranscriptLength);
            setMessage((prev) => prev + newContent);
            setLastTranscriptLength(finalTranscript.length);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);

          let errorMessage = "Could not process voice input. Please try again.";
          let errorTitle = "Voice recognition error";
          let shouldRetry = false;

          // Provide specific error messages
          switch (event.error) {
            case "network":
              errorTitle = "Speech Service Connection Failed";
              errorMessage =
                "Unable to connect to speech recognition service. This can happen due to:\n" +
                "• Temporary server issues (Google's servers)\n" +
                "• Network connectivity problems\n" +
                "• Browser limitations\n\n" +
                "Solutions:\n" +
                "• Try again in a few seconds\n" +
                "• Check your internet connection\n" +
                "• Switch to Chrome browser\n" +
                "• Refresh the page";
              shouldRetry = retryCount < 2; // Retry up to 2 times
              break;
            case "not-allowed":
              errorTitle = "Microphone Access Denied";
              errorMessage =
                "Please allow microphone access in your browser settings and refresh the page.";
              break;
            case "no-speech":
              // Don't show error for no-speech, just stop recording
              console.log("No speech detected, stopping recording");
              return;
            case "audio-capture":
              errorTitle = "Microphone Error";
              errorMessage =
                "Microphone not available. Please check your microphone connection and try again.";
              break;
            case "service-not-allowed":
              errorTitle = "Speech Service Unavailable";
              errorMessage =
                "Speech recognition service is temporarily unavailable. Try again in a few moments.";
              shouldRetry = retryCount < 1; // Retry once for service issues
              break;
            case "aborted":
              // Don't show error for user-initiated abort
              return;
            case "language-not-supported":
              errorTitle = "Language Not Supported";
              errorMessage =
                "The selected language is not supported. Switching to English.";
              break;
            default:
              errorTitle = "Speech Recognition Error";
              errorMessage = `An error occurred: ${event.error}. Try refreshing the page or using Chrome browser.`;
          }

          // Auto-retry for network issues
          if (shouldRetry) {
            setRetryCount((prev) => prev + 1);
            setTimeout(() => {
              console.log(
                `Retrying speech recognition... Attempt ${retryCount + 1}`
              );
              try {
                recognitionInstance.start();
              } catch (retryError) {
                console.error("Retry failed:", retryError);
              }
            }, 1000 * (retryCount + 1)); // Exponential backoff

            toast({
              title: "Retrying...",
              description: `Connection failed. Retrying in ${
                retryCount + 1
              } second(s)...`,
            });
          } else {
            toast({
              title: errorTitle,
              description: errorMessage,
              variant: "destructive",
              action:
                event.error === "network" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTroubleshooting(true)}
                  >
                    Get Help
                  </Button>
                ) : undefined,
            });
          }
        };

        recognitionInstance.onend = () => {
          console.log("Speech recognition ended");
          setIsRecording(false);
          try {
            onRecordingChange?.(false);
          } catch {}
          setLastTranscriptLength(0);
        };

        setRecognition(recognitionInstance);
        setIsSpeechSupported(true);
        console.log("Speech recognition initialized successfully");
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error);
        setIsSpeechSupported(false);
        toast({
          title: "Speech Recognition Setup Failed",
          description:
            "Unable to initialize voice input. Please refresh the page and try again.",
          variant: "destructive",
        });
      }
    };

    initializeSpeechRecognition();

    // Cleanup function
    return () => {
      if (recognition && isRecording) {
        try {
          recognition.stop();
        } catch (error) {
          console.error("Error stopping recognition during cleanup:", error);
        }
      }
    };
  }, [toast]);

  const handleSend = async () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = async () => {
    if (!recognition) {
      // Check if we're in Brave browser
      const isBrave =
        (navigator as any).brave &&
        (await (navigator as any).brave.isBrave?.());

      // Check if speech recognition is supported
      const supported =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
      const isSecure =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      let errorMessage = "Your browser doesn't support voice input.";
      let errorTitle = "Speech recognition not available";

      if (!supported) {
        if (isBrave) {
          errorTitle = "Brave Browser Detected";
          errorMessage =
            "Brave blocks speech recognition by default. Please:\n• Switch to Chrome browser\n• Or enable speech APIs in Brave settings\n• Go to brave://settings/privacy for options";
        } else {
          errorMessage =
            "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.";
        }
      } else if (!isSecure) {
        errorMessage = "Voice input requires a secure connection (HTTPS).";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        action: isBrave ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTroubleshooting(true)}
          >
            Brave Fix
          </Button>
        ) : undefined,
      });
      return;
    }

    if (isRecording) {
      try {
        recognition.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
        setIsRecording(false);
        try {
          onRecordingChange?.(false);
        } catch {}
      }
    } else {
      try {
        // Clear the input box when starting a new recording session
        setMessage("");
        setLastTranscriptLength(0);

        // Also reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }

        // Check microphone permission before starting
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Close the stream immediately, we just needed to check permissions
        stream.getTracks().forEach((track) => track.stop());

        // Add a small delay to ensure previous recognition is fully stopped
        await new Promise((resolve) => setTimeout(resolve, 1000));

        recognition.start();
        setRetryCount(0); // Reset retry count on successful start
        toast({
          title: "Listening...",
          description: "Speak now to convert speech to text.",
        });
      } catch (error: any) {
        console.error("Error starting recognition:", error);

        let errorTitle = "Unable to start voice input";
        let errorMessage = "Please check your microphone and try again.";

        if (error.name === "NotAllowedError") {
          errorTitle = "Microphone Access Denied";
          errorMessage =
            "Please allow microphone access in your browser settings and refresh the page.";
        } else if (error.name === "NotFoundError") {
          errorTitle = "Microphone Not Found";
          errorMessage =
            "No microphone detected. Please connect a microphone and try again.";
        } else if (error.name === "NotReadableError") {
          errorTitle = "Microphone In Use";
          errorMessage =
            "Your microphone is being used by another application. Please close other apps and try again.";
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        try {
          onRecordingChange?.(false);
        } catch {}
      }
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <div className="border-t border-border p-3 bg-card">
      {/* Global theme toggle pinned to top-right */}
      <div className="fixed top-2 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMonochrome}
          className="w-9 h-9 p-0"
          title={
            isMonochrome
              ? "Switch to Color Mode"
              : "Switch to Black & White Mode"
          }
        >
          {isMonochrome ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </div>

      <div className="flex gap-2 items-end max-w-4xl mx-auto">
        {!hideMicButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            disabled={!isSpeechSupported}
            className={`transition-smooth ${
              isRecording
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-glow"
                : "hover:bg-accent"
            } ${!isSpeechSupported ? "opacity-50 cursor-not-allowed" : ""}`}
            title={
              !isSpeechSupported
                ? "Speech recognition not available"
                : isRecording
                ? "Stop recording"
                : "Start voice input"
            }
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
        )}

        {!isSpeechSupported && (
          <Dialog open={showMicTest} onOpenChange={setShowMicTest}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Test microphone setup">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <MicrophoneTest onClose={() => setShowMicTest(false)} />
            </DialogContent>
          </Dialog>
        )}

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e: any) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or use voice input..."
            className="resize-none min-h-[40px] max-h-32 pr-12 transition-smooth"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="absolute text-white right-2 bottom-1 h-8 w-8 bg-gradient-primary hover:shadow-glow transition-smooth disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isRecording && (
        <div className="flex items-center justify-center mt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            Recording... Click mic to stop
          </div>
        </div>
      )}

      {/* Troubleshooting Dialog for Network Issues */}
      <Dialog open={showTroubleshooting} onOpenChange={setShowTroubleshooting}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <TroubleshootingGuide
            onClose={() => setShowTroubleshooting(false)}
            onRetry={toggleRecording}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
