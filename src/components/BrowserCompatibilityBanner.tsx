import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Shield, Chrome, Settings } from "lucide-react";

export const BrowserCompatibilityBanner = () => {
  const [browserInfo, setBrowserInfo] = useState<{
    isBrave: boolean;
    isChrome: boolean;
    isFirefox: boolean;
    isSafari: boolean;
    isSupported: boolean;
  }>({
    isBrave: false,
    isChrome: false,
    isFirefox: false,
    isSafari: false,
    isSupported: false,
  });

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const detectBrowser = async () => {
      const userAgent = navigator.userAgent;
      const isBrave =
        (navigator as any).brave &&
        (await (navigator as any).brave.isBrave?.());
      const isChrome = /Chrome/.test(userAgent) && !isBrave;
      const isFirefox = /Firefox/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

      const hasSpeechRecognition =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

      const info = {
        isBrave,
        isChrome,
        isFirefox,
        isSafari,
        isSupported: hasSpeechRecognition && !isFirefox,
      };

      setBrowserInfo(info);

      // Show banner for unsupported browsers or Brave
      if (isBrave || isFirefox || !hasSpeechRecognition) {
        setShowBanner(true);
      }
    };

    detectBrowser();
  }, []);

  if (!showBanner) return null;

  const getBannerContent = () => {
    if (browserInfo.isBrave) {
      return {
        title: "Brave Browser Detected",
        description:
          "Speech recognition is disabled by default in Brave for privacy. Switch to Chrome or enable speech APIs in Brave settings.",
        icon: <Shield className="h-4 w-4" />,
        variant: "default" as const,
        actions: (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={() =>
                window.open("https://www.google.com/chrome/", "_blank")
              }
            >
              <Chrome className="h-3 w-3 mr-1" />
              Get Chrome
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("brave://settings/privacy", "_blank")}
            >
              <Settings className="h-3 w-3 mr-1" />
              Brave Settings
            </Button>
          </div>
        ),
      };
    } else if (browserInfo.isFirefox) {
      return {
        title: "Firefox Not Supported",
        description:
          "Firefox doesn't support Web Speech API. Please switch to Chrome, Edge, or Safari for voice input.",
        icon: <Chrome className="h-4 w-4" />,
        variant: "destructive" as const,
        actions: (
          <Button
            size="sm"
            className="mt-2"
            onClick={() =>
              window.open("https://www.google.com/chrome/", "_blank")
            }
          >
            <Chrome className="h-3 w-3 mr-1" />
            Download Chrome
          </Button>
        ),
      };
    } else {
      return {
        title: "Speech Recognition Not Available",
        description:
          "Your browser doesn't support speech recognition. Please use a supported browser.",
        icon: <Chrome className="h-4 w-4" />,
        variant: "destructive" as const,
        actions: (
          <Button
            size="sm"
            className="mt-2"
            onClick={() =>
              window.open("https://www.google.com/chrome/", "_blank")
            }
          >
            <Chrome className="h-3 w-3 mr-1" />
            Get Chrome
          </Button>
        ),
      };
    }
  };

  const content = getBannerContent();

  return (
    <Alert variant={content.variant} className="mb-4">
      {content.icon}
      <AlertTitle>{content.title}</AlertTitle>
      <AlertDescription>
        {content.description}
        {content.actions}
      </AlertDescription>
    </Alert>
  );
};
