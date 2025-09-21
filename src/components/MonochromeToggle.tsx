import { Button } from "./ui/button";
import { useMonochrome } from "../context/MonochromeContext";
import { Palette } from "lucide-react";

export const MonochromeToggle = () => {
  const { isMonochrome, toggleMonochrome } = useMonochrome();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant={isMonochrome ? "default" : "secondary"}
        onClick={toggleMonochrome}
        className={
          isMonochrome
            ? "bg-black text-white hover:bg-gray-800"
            : "hover:bg-accent"
        }
        title={isMonochrome ? "Switch to Color" : "Switch to Black & White"}
      >
        <Palette className="w-4 h-4 mr-2" />
        {isMonochrome ? "B&W" : "Color"}
      </Button>
    </div>
  );
};
