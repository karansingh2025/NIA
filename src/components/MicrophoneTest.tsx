import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Mic, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface MicrophoneTestProps {
  onClose: () => void;
}

export const MicrophoneTest = ({ onClose }: MicrophoneTestProps) => {
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const testMicrophone = async () => {
    setTestStatus("testing");
    setErrorMessage("");

    try {
      // Check if speech recognition is supported
      const hasWebkitSpeechRecognition = "webkitSpeechRecognition" in window;
      const hasSpeechRecognition = "SpeechRecognition" in window;

      if (!hasWebkitSpeechRecognition && !hasSpeechRecognition) {
        throw new Error(
          "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
        );
      }

      // Check if we're on HTTPS or localhost
      const isSecure =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isSecure) {
        throw new Error("Voice input requires a secure connection (HTTPS).");
      }

      // Test microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      // Test speech recognition initialization
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      // Test starting and stopping recognition
      recognition.start();
      setTimeout(() => {
        recognition.stop();
      }, 1000);

      recognition.onend = () => {
        setTestStatus("success");
        toast({
          title: "Microphone Test Successful",
          description:
            "Your microphone and speech recognition are working properly!",
        });
      };

      recognition.onerror = (event: any) => {
        throw new Error(`Speech recognition error: ${event.error}`);
      };
    } catch (error: any) {
      setTestStatus("error");
      setErrorMessage(error.message);
      toast({
        title: "Microphone Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case "testing":
        return <Mic className="w-6 h-6 animate-pulse text-blue-500" />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (testStatus) {
      case "testing":
        return "Testing microphone...";
      case "success":
        return "Microphone is working correctly!";
      case "error":
        return "Microphone test failed";
      default:
        return "Click to test your microphone";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Microphone Test
        </CardTitle>
        <CardDescription>
          Test your microphone and speech recognition setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {getStatusText()}
          </p>
          {errorMessage && (
            <p className="text-sm text-red-500 mb-4 p-2 bg-red-50 rounded border">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Requirements:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Chrome, Edge, or Safari browser</li>
            <li>• HTTPS connection or localhost</li>
            <li>• Microphone permissions allowed</li>
            <li>• Working microphone device</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={testMicrophone}
            disabled={testStatus === "testing"}
            className="flex-1"
          >
            {testStatus === "testing" ? "Testing..." : "Test Microphone"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
