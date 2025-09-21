import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Sun,
  Moon,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { MessageInput } from "../components/MessageInput";
import { useNavigate } from "react-router-dom";
import { useMonochrome } from "../context/MonochromeContext";
import { useToast } from "../components/ui/use-toast";
import axios from "axios";

// AI Interview Bot with structured question flow, continuous listening, and real-time speech display
export default function MockInterview() {
  const navigate = useNavigate();
  const { isMonochrome, toggleMonochrome } = useMonochrome();
  const { toast } = useToast();

  // AI Interview Bot State
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [liveTranscript, setLiveTranscript] = useState(""); // Real-time speech display
  const [liveTranscriptTimer, setLiveTranscriptTimer] =
    useState<NodeJS.Timeout | null>(null); // Timer to clear live transcript
  const [accumulatedTranscript, setAccumulatedTranscript] = useState(""); // Track accumulated final text
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Separate states for interview configuration
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [numQuestions, setNumQuestions] = useState(5);
  const [topic, setTopic] = useState("");

  // Recording state with 1-minute timeout
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(60);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  type Msg = { id: string; author: "bot" | "user"; text: string; ts: number };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [botStream, setBotStream] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Track total finalized transcript from current recognition session to avoid duplicates
  const finalSoFarRef = useRef<string>("");

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Text-to-Speech state
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Interview Questions Flow - now dynamic based on API response
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [questionIds, setQuestionIds] = useState<string[]>([]); // Store question IDs separately
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Store user answers for backend submission
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [sessionId, setSessionId] = useState<string>(""); // Generate session ID when interview starts

  // Interview results state
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [interviewResults, setInterviewResults] = useState<any>(null);

  const generateInterviewQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const response = await axios.post(
        "https://nia-interview-bot.onrender.com/generate-questions",
        {
          headers: {
            "Content-Type": "application/json",
          },
          topic: topic || "General Interview",
          difficulty: difficulty,
          num_questions: numQuestions,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to generate questions");
      }

      const data = response.data;
      const questions = data.questions || [];

      // Extract question text and IDs from response format
      const questionTexts: string[] = [];
      const questionIds: string[] = [];

      questions.forEach((q: any) => {
        // Handle different possible response formats
        if (typeof q === "string") {
          questionTexts.push(q);
          questionIds.push(`q_${questionTexts.length}`); // fallback ID
        } else if (q?.question && q?.id) {
          questionTexts.push(q.question);
          questionIds.push(q.id);
        } else if (q?.text && q?.id) {
          questionTexts.push(q.text);
          questionIds.push(q.id);
        } else {
          questionTexts.push(String(q));
          questionIds.push(`q_${questionTexts.length}`); // fallback ID
        }
      });

      setGeneratedQuestions(questionTexts);
      setQuestionIds(questionIds);
      setSessionId(data.session_id || "session_default");
      return questionTexts;
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error generating questions",
        description:
          "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
      // Fallback to a basic question if API fails
      const fallbackQuestions = [
        `Hi! I'm your AI interviewer for ${
          topic || "a general interview"
        }. Let's start with a simple introduction. Can you tell me about yourself?`,
        "Thank you for your response! That concludes our interview.",
      ];
      const fallbackIds = ["q_intro", "q_conclusion"];

      setGeneratedQuestions(fallbackQuestions.slice(0, numQuestions));
      setQuestionIds(fallbackIds.slice(0, numQuestions));
      return fallbackQuestions.slice(0, numQuestions);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const interviewQuestions = generatedQuestions;

  // Submit individual answer (store locally and optionally submit to backend)
  const storeAnswer = (answer: string) => {
    if (!answer.trim()) return;

    // Store answer locally
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answer.trim();
      return newAnswers;
    });
  };

  // Submit all answers to backend at the end of interview
  const submitAllAnswers = async () => {
    if (userAnswers.length === 0) return;

    setIsSubmittingAnswer(true);
    try {
      // Format answers according to the required structure using actual question IDs
      const formattedAnswers = userAnswers.map((answer, index) => ({
        session_id: sessionId,
        question_id: questionIds[index], // Use actual question ID
        answer: answer || "",
      }));

      const response = await axios.post(
        "https://nia-interview-bot.onrender.com/evaluate-interview",
        {
          session_id: sessionId,
          answers: formattedAnswers,
        }
      );

      // Store results and show modal
      setInterviewResults(response.data);
      setShowResultsModal(true);

      toast({
        title: "Interview Completed!",
        description: "Your answers have been submitted for evaluation.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error submitting answers:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botStream]);

  const lastBotMessage = [...messages]
    .reverse()
    .find((m) => m.author === "bot");

  // Camera controls
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera API not supported in this browser.");
        return;
      }
      if (
        !window.isSecureContext &&
        !["localhost", "127.0.0.1"].includes(window.location.hostname)
      ) {
        setCameraError("Camera requires HTTPS or localhost.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
      setCameraError(null);
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError"
          ? "Camera access blocked. Allow permission and try again."
          : err?.message || "Failed to start camera.";
      setCameraError(msg);
      setCameraOn(false);
    }
  };

  const stopCamera = () => {
    const el = videoRef.current as HTMLVideoElement | null;
    const stream = (el?.srcObject as MediaStream | null) || null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    if (el) el.srcObject = null;
    setCameraOn(false);
  };

  // Text-to-Speech functions
  const speakText = (text: string) => {
    if (!isSpeechEnabled || !window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice settings
    utterance.rate = 1; // Slightly slower for better understanding
    utterance.pitch = 1; // Normal pitch
    utterance.volume = 0.8; // 80% volume

    // Try to find a professional-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Microsoft") ||
        voice.name.includes("Alex") ||
        voice.lang.startsWith("en")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Set up event handlers
    utterance.onstart = () => {
      setIsBotSpeaking(true);
    };

    utterance.onend = () => {
      setIsBotSpeaking(false);
    };

    utterance.onerror = () => {
      setIsBotSpeaking(false);
      console.error("Speech synthesis error");
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsBotSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    if (!isSpeechEnabled) {
      stopSpeaking();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopSpeaking(); // Clean up speech synthesis
    };
  }, []);
  // Bot streaming animation
  const askQuestion = (questionText: string) => {
    if (!questionText) return;
    setIsBotSpeaking(true);
    setBotStream("");
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setBotStream(questionText.slice(0, i));
      if (i >= questionText.length) {
        clearInterval(interval);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            author: "bot",
            text: questionText,
            ts: Date.now(),
          },
        ]);
        setBotStream("");
        setIsBotSpeaking(false);
        setIsWaitingForResponse(true);

        // Speak the question after typing animation completes
        setTimeout(() => {
          speakText(questionText);
        }, 500);
      }
    }, 30);
  };

  // Move to next question
  const moveToNextQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      // If recording is active, stop it first
      if (isRecording) {
        stopRecording();
      }

      // Capture the next index we'll use - fixes the async state update issue
      const nextIndex = currentQuestionIndex + 1;

      setCurrentQuestionIndex(nextIndex);
      setUserResponse("");
      setAccumulatedTranscript(""); // Reset accumulated transcript for new question
      setLiveTranscript(""); // Clear live transcript for new question
      setIsWaitingForResponse(false);

      // Small delay before asking next question - using nextIndex instead of state
      setTimeout(() => {
        askQuestion(interviewQuestions[nextIndex]);
      }, 1000);
    } else {
      // Interview is complete, submit all answers
      submitAllAnswers();
    }
  };

  // This function is now simpler - just manages transcript display without silence detection
  // We've removed the processing logic since we only want to process at the end of recording
  const handleUserSpeech = (transcript: string, isFinal: boolean = false) => {
    // For our new implementation, we don't need complex handling
    // Everything will be processed at stopRecording

    // No timer clearing needed - transcript stays visible during recording
    return; // This function is now just a stub since all logic is in the recognition handlers
  };

  // Start recording with 1 minute timeout
  const startRecording = async () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Speech recognition not supported",
        description:
          "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isSecure) {
      toast({
        title: "Insecure context",
        description: "Speech recognition requires HTTPS or localhost.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Stop any existing recognition first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }

      // Don't clear previous transcripts if already waiting for response
      // This allows continuation of an answer after temporary breaks
      if (!isWaitingForResponse) {
        // Only clear if this is a fresh recording (new question)
        setLiveTranscript("");
        setAccumulatedTranscript("");
        finalSoFarRef.current = "";
      } else {
        // For continuing an answer, ensure the live transcript shows accumulated text
        setLiveTranscript(accumulatedTranscript);
      }

      // Create new recognition instance
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 1;

      // Set up handlers
      rec.onstart = () => {
        setIsMicListening(true);
        setIsRecording(true);
        setRecordingTimeLeft(60); // Reset to 60 seconds
        finalSoFarRef.current = "";

        // Start the 1-minute countdown
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }

        recordingTimerRef.current = setInterval(() => {
          setRecordingTimeLeft((prev) => {
            if (prev <= 1) {
              stopRecording(true); // Pass true to indicate timer expired
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      };

      rec.onend = () => {
        setIsMicListening(false);
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);

        // Don't stop on certain recoverable errors
        if (e.error === "no-speech" || e.error === "aborted") {
          console.log("Recoverable error, continuing...");
          return;
        }

        stopRecording();
        toast({
          title: "Recognition error",
          description: `Error: ${e.error || "unknown"}. Please try again.`,
          variant: "destructive",
        });
      };

      rec.onresult = (event: any) => {
        console.log("Speech recognition result event:", event);

        // Get the latest result from this event
        let latestInterim = "";
        let latestFinal = "";

        // Process only the latest results from this event
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim();

          if (result.isFinal) {
            latestFinal += transcript;
          } else {
            latestInterim += transcript;
          }
        }

        console.log("Latest final:", latestFinal);
        console.log("Latest interim:", latestInterim);

        // Handle interim results - show accumulated + new interim
        if (latestInterim) {
          const displayText =
            accumulatedTranscript +
            (accumulatedTranscript && latestInterim ? " " : "") +
            latestInterim;
          setLiveTranscript(displayText);
          console.log("Displaying interim:", displayText);
        }

        // Handle final results - add to accumulated
        if (latestFinal) {
          const newAccumulated =
            accumulatedTranscript +
            (accumulatedTranscript && latestFinal ? " " : "") +
            latestFinal;

          setAccumulatedTranscript(newAccumulated);
          setLiveTranscript(newAccumulated);
          console.log("New accumulated:", newAccumulated);
        }
      };

      // Store reference and start
      recognitionRef.current = rec;

      // Request mic permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());

      // Start recognition
      rec.start();
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Microphone error",
        description:
          "Could not access the microphone. Please check permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
      setIsMicListening(false);
    }
  };

  // Stop recording and process the complete answer
  const stopRecording = (isTimerExpired = false) => {
    // Prevent running this function recursively
    if (!recognitionRef.current) return;

    const rec = recognitionRef.current;
    try {
      rec.onend = null;
      rec.onerror = null;
      rec.onresult = null;
      rec.stop();
    } catch {}
    recognitionRef.current = null;

    setIsRecording(false);
    setIsMicListening(false);

    // Clear timers
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Only process and move to next question when the 1-minute timer expires
    // OR when user manually stops AND has some content to submit
    if (
      isTimerExpired ||
      (accumulatedTranscript.trim() && isWaitingForResponse)
    ) {
      console.log("Processing final answer:", accumulatedTranscript.trim());

      // Add the complete accumulated transcript as a single user message
      if (accumulatedTranscript.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            author: "user",
            text: accumulatedTranscript.trim(),
            ts: Date.now(),
          },
        ]);

        // Submit the answer to backend (store locally for now)
        storeAnswer(accumulatedTranscript.trim());
      }

      // Clear transcript from UI
      setLiveTranscript("");

      // Clear any timers that would clear the transcript
      if (liveTranscriptTimer) {
        clearTimeout(liveTranscriptTimer);
        setLiveTranscriptTimer(null);
      }

      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }

      // Reset transcript state before moving to next question
      setAccumulatedTranscript("");

      // Automatically move to next question after processing the answer
      setTimeout(() => {
        moveToNextQuestion();
      }, 500);
    } else {
      // Just pausing - keep everything for continuation
      console.log("Paused recording - keeping transcript for continuation");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (liveTranscriptTimer) {
        clearTimeout(liveTranscriptTimer);
      }
    };
  }, []);

  // Start interview with configuration
  const handleStartInterview = () => {
    setShowConfigModal(true);
  };

  const confirmStartInterview = async () => {
    // Generate questions first
    const questions = await generateInterviewQuestions();
    if (questions.length > 0) {
      setShowConfigModal(false);
      setInterviewStarted(true);
      askQuestion(questions[0]);
    } else {
      // Show error or use fallback
      toast({
        title: "Unable to start interview",
        description: "Could not generate questions. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NIA</span>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center space-x-8">
                {[
                  { label: "Dashboard", path: "/dashboard" },
                  { label: "AI Chat", path: "/chat" },
                  { label: "Roadmaps", path: "/roadmaps" },
                  { label: "Resume Analyzer", path: "/resume-analyzer" },
                  { label: "Mock Interview", path: "/mock-interview" },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2">
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

                <div className="md:hidden">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto p-6">
        <Card className="relative h-[45vw] overflow-hidden rounded-3xl p-6 md:p-10 bg-gradient-to-br from-fuchsia-500/10 via-amber-400/10 to-teal-500/10 border-border">
          {/* Bot speech bubble */}
          <div className="absolute top-6 left-6 right-6 md:right-auto md:max-w-3xl">
            <div className="bg-card border rounded-2xl shadow-xl p-5 md:p-6 text-base md:text-lg leading-relaxed">
              {botStream ? (
                <span>
                  {botStream}
                  <span className="inline-block w-2 h-5 align-middle bg-primary/80 ml-1 animate-pulse" />
                </span>
              ) : (
                lastBotMessage?.text ||
                (interviewStarted
                  ? "I'm listening for your response..."
                  : "Welcome to your AI mock interview. Click 'Start Interview' when you're ready!")
              )}
            </div>
          </div>

          {/* Live transcript display - shows what user is speaking in real time */}
          {liveTranscript && (
            <div className="absolute top-32 left-6 right-6 md:right-auto md:max-w-3xl z-10">
              <div className="bg-emerald-50/95 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg p-3 md:p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    You're speaking...
                  </span>
                </div>
                <div className="text-sm md:text-base text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {liveTranscript}
                  <span className="inline-block w-1 h-4 align-middle bg-emerald-500/80 ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Bot avatar with waves */}
          <div className="flex items-center justify-center py-24 md:py-32">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <div
                className={`absolute inset-0 rounded-full ${
                  isBotSpeaking ? "animate-ping" : ""
                } bg-primary/20`}
              />
              <div
                className={`absolute inset-4 rounded-full ${
                  isBotSpeaking ? "animate-ping" : ""
                } bg-primary/20 delay-150`}
              />
              <div
                className={`absolute inset-8 rounded-full ${
                  isBotSpeaking ? "animate-ping" : ""
                } bg-primary/20 delay-300`}
              />
              {isMicListening && (
                <div className="absolute -inset-3 rounded-full border-2 border-emerald-400/70 animate-pulse" />
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-5xl">NIA</span>
              </div>
            </div>
          </div>

          {/* Camera tile */}
          <div className="absolute bottom-6 left-6 w-40 h-28 md:w-56 md:h-36 rounded-xl overflow-hidden border bg-black/30 backdrop-blur-sm">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col">
              <div className="p-2">
                <span className="inline-flex items-center rounded-md bg-background/80 backdrop-blur px-2 py-0.5 text-[11px] text-foreground border">
                  {cameraOn ? "Camera On" : "Camera Off"}
                </span>
              </div>
              <div className="mt-auto p-2 flex justify-end gap-1">
                <div className="pointer-events-auto">
                  <Button
                    size="icon"
                    variant={isSpeechEnabled ? "default" : "secondary"}
                    className="h-8 w-8 rounded-full"
                    onClick={toggleSpeech}
                    title={
                      isSpeechEnabled ? "Disable AI voice" : "Enable AI voice"
                    }
                  >
                    {isSpeechEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="pointer-events-auto">
                  {cameraOn ? (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      onClick={stopCamera}
                      title="Turn camera off"
                    >
                      <VideoOff className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="default"
                      className="h-8 w-8 rounded-full"
                      onClick={startCamera}
                      title="Turn camera on"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {cameraError && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 gap-2">
                <span className="text-xs text-muted-foreground">
                  {cameraError}
                </span>
                <Button size="sm" variant="outline" onClick={startCamera}>
                  Retry
                </Button>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-6 right-6 z-10">
            <div className="inline-flex items-center gap-3 bg-background/80 backdrop-blur-sm border rounded-xl px-3 py-2 shadow-lg">
              <div className="hidden sm:block text-sm text-muted-foreground whitespace-nowrap">
                <span className="font-medium">
                  Question {currentQuestionIndex + 1}/
                  {interviewQuestions.length}
                </span>
                {isRecording && (
                  <>
                    <span className="mx-2">|</span>
                    <span className="text-emerald-600">
                      Recording... {recordingTimeLeft}s
                    </span>
                  </>
                )}
                {isSubmittingAnswer && (
                  <>
                    <span className="mx-2">|</span>
                    <span className="text-blue-600">Submitting answer...</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!interviewStarted ? (
                  <Button variant="default" onClick={handleStartInterview}>
                    Start Interview
                  </Button>
                ) : (
                  <>
                    {isRecording ? (
                      <Button
                        variant="destructive"
                        onClick={() => stopRecording(false)}
                        className="gap-2"
                      >
                        <MicOff className="h-4 w-4" />
                        Stop Recording
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={startRecording}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Mic className="h-4 w-4" />
                        Record Answer
                      </Button>
                    )}
                    <Button variant="outline" onClick={moveToNextQuestion}>
                      Next Question
                    </Button>
                  </>
                )}
                <Button
                  variant="secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  End Interview
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 p-6 bg-background border">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    Configure Your Interview
                  </h2>
                  <p className="text-muted-foreground">
                    Customize your mock interview experience
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Topic Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Interview Topic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Frontend Development, Data Structures, System Design..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>

                  {/* Difficulty Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["beginner", "intermediate", "advanced"].map((level) => (
                        <Button
                          key={level}
                          variant={difficulty === level ? "default" : "outline"}
                          onClick={() =>
                            setDifficulty(
                              level as "beginner" | "intermediate" | "advanced"
                            )
                          }
                          className="capitalize"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Number of Questions: {numQuestions}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={numQuestions}
                      onChange={(e) =>
                        setNumQuestions(parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>20</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Topic:</span>{" "}
                        <span>{topic || "General Interview"}</span>
                      </div>
                      <div>
                        <span className="font-medium">Difficulty:</span>{" "}
                        <span className="capitalize">{difficulty}</span>
                      </div>
                      <div>
                        <span className="font-medium">Questions:</span>{" "}
                        {numQuestions}
                      </div>
                      <div>
                        <span className="font-medium">Estimated Time:</span>{" "}
                        {Math.ceil(numQuestions * 2)} minutes
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1"
                    disabled={isGeneratingQuestions}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmStartInterview}
                    className="flex-1"
                    disabled={isGeneratingQuestions}
                  >
                    {isGeneratingQuestions
                      ? "Generating Questions..."
                      : "Start Interview"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Results Modal */}
        {showResultsModal && interviewResults && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border">
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Interview Results</h2>
                  <p className="text-muted-foreground">
                    Here's your performance summary
                  </p>
                </div>

                {/* Overall Score */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                      Overall Performance
                    </h3>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {interviewResults.percentage}%
                      </div>
                      <div className="text-lg font-medium text-muted-foreground">
                        Grade: {interviewResults.grade}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${interviewResults.percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Score: {interviewResults.overall_score} /{" "}
                    {interviewResults.max_possible_score}
                  </div>
                </div>

                {/* Topic and Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Topic</div>
                    <div className="font-semibold">
                      {interviewResults.topic}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">
                      Difficulty
                    </div>
                    <div className="font-semibold capitalize">
                      {interviewResults.difficulty}
                    </div>
                  </div>
                </div>

                {/* Overall Feedback */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                  <h3 className="text-lg font-semibold mb-3 text-amber-800 dark:text-amber-200">
                    Overall Feedback
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300">
                    {interviewResults.overall_feedback}
                  </p>
                </div>

                {/* Strengths */}
                {interviewResults.strengths &&
                  interviewResults.strengths.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <h3 className="text-lg font-semibold mb-3 text-green-800 dark:text-green-200">
                        💪 Strengths
                      </h3>
                      <ul className="space-y-2">
                        {interviewResults.strengths.map(
                          (strength: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-green-700 dark:text-green-300"
                            >
                              <span className="text-green-500 mt-1">•</span>
                              <span>{strength}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Areas for Improvement */}
                {interviewResults.areas_for_improvement &&
                  interviewResults.areas_for_improvement.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <h3 className="text-lg font-semibold mb-3 text-orange-800 dark:text-orange-200">
                        🎯 Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {interviewResults.areas_for_improvement.map(
                          (area: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-orange-700 dark:text-orange-300"
                            >
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{area}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Recommendations */}
                {interviewResults.recommendations &&
                  interviewResults.recommendations.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
                        💡 Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {interviewResults.recommendations.map(
                          (rec: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-blue-700 dark:text-blue-300"
                            >
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Question-wise Performance */}
                {interviewResults.question_evaluations &&
                  interviewResults.question_evaluations.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">
                        Question-wise Performance
                      </h3>
                      {interviewResults.question_evaluations.map(
                        (evaluation: any, index: number) => (
                          <div
                            key={evaluation.question_id}
                            className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-semibold text-lg">
                                Question {index + 1}
                              </h4>
                              <div className="text-right">
                                <div className="text-lg font-bold">
                                  {evaluation.score} / {evaluation.max_score}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {Math.round(
                                    (evaluation.score / evaluation.max_score) *
                                      100
                                  )}
                                  %
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                  Question
                                </div>
                                <div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border">
                                  {evaluation.question}
                                </div>
                              </div>

                              <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                  Your Answer
                                </div>
                                <div className="text-sm bg-white dark:bg-gray-800 p-3 rounded border">
                                  {evaluation.answer}
                                </div>
                              </div>

                              {evaluation.feedback && (
                                <div>
                                  <div className="text-sm font-medium text-muted-foreground mb-1">
                                    Feedback
                                  </div>
                                  <div className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                                    {evaluation.feedback}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowResultsModal(false)}
                    className="flex-1"
                  >
                    Close Results
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResultsModal(false);
                      window.location.reload(); // Restart interview
                    }}
                    className="flex-1"
                  >
                    Take Another Interview
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
