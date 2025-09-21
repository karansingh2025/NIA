import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  AlertTriangle,
  Wifi,
  RefreshCw,
  Chrome,
  Settings,
  Mic,
} from "lucide-react";

interface TroubleshootingGuideProps {
  onClose: () => void;
  onRetry: () => void;
}

export const TroubleshootingGuide = ({
  onClose,
  onRetry,
}: TroubleshootingGuideProps) => {
  const troubleshootingSteps = [
    {
      icon: <Chrome className="w-5 h-5 text-green-500" />,
      title: "Browser Compatibility",
      description: "Speech recognition requires specific browser support.",
      steps: [
        "✅ Chrome (Recommended - Best support)",
        "✅ Edge (Good support)",
        "✅ Safari (Limited support)",
        "⚠️ Brave (Blocked by default - see below)",
        "❌ Firefox (No support)",
      ],
    },
    {
      icon: <Settings className="w-5 h-5 text-orange-500" />,
      title: "Brave Browser Fix",
      description: "Brave blocks speech recognition by default for privacy.",
      steps: [
        "Go to brave://settings/privacy in Brave",
        "Scroll to 'Web3' section",
        "Enable 'Allow Google login for extensions'",
        "OR switch to Chrome for better compatibility",
        "Refresh this page after changing settings",
      ],
    },
    {
      icon: <Wifi className="w-5 h-5 text-blue-500" />,
      title: "Check Internet Connection",
      description:
        "Speech recognition requires an active internet connection to Google's servers.",
      steps: [
        "Verify you're connected to the internet",
        "Try loading another website",
        "Restart your router if needed",
      ],
    },
    {
      icon: <Mic className="w-5 h-5 text-purple-500" />,
      title: "Test Microphone",
      description: "Verify your microphone is working correctly.",
      steps: [
        "Test microphone in other applications",
        "Check system microphone settings",
        "Ensure no other apps are using the microphone",
      ],
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-red-500" />,
      title: "Wait and Retry",
      description: "Google's speech service may be temporarily unavailable.",
      steps: [
        "Wait 30-60 seconds before retrying",
        "Refresh the browser page",
        "Try again during different time periods",
      ],
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          Speech Recognition Troubleshooting
        </CardTitle>
        <CardDescription>
          Follow these steps to resolve speech recognition issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {troubleshootingSteps.map((step, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              {step.icon}
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {step.description}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {step.steps.map((stepItem, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-1">
                      <span className="text-primary">•</span>
                      <span>{stepItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2 text-orange-800 dark:text-orange-200">
            🛡️ Brave Browser Users:
          </h4>
          <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
            <li>
              • Brave blocks speech recognition by default for privacy
              protection
            </li>
            <li>
              • Go to{" "}
              <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">
                brave://settings/privacy
              </code>
            </li>
            <li>• Look for "Web3" or "Google services" settings</li>
            <li>• Enable necessary permissions or switch to Chrome</li>
            <li>• Brave's shields may interfere with Google's speech API</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2 text-blue-800 dark:text-blue-200">
            Common Network Error Solutions:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>
              • The error "unable to connect to speech service" usually means
              Google's speech API is temporarily unreachable
            </li>
            <li>
              • This is often caused by network issues or temporary server
              problems
            </li>
            <li>
              • Try switching to a different network (mobile hotspot) to test
              connectivity
            </li>
            <li>
              • VPNs or corporate firewalls may block speech recognition
              services
            </li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button onClick={onRetry} className="flex-1">
            Try Again
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
