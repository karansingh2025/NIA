import { useState } from "react";
import { Upload, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validatePDF = (file: File): boolean => {
    return file.type === "application/pdf";
  };

  const handleFile = (file: File) => {
    if (!validatePDF(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    onFileUpload(file);
    toast({
      title: "Resume uploaded successfully",
      description: `${file.name} has been uploaded.`,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 transition-smooth hover:border-primary ${
        dragActive ? "border-primary bg-primary/10" : "border-border"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="text-center">
        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-xs text-muted-foreground mb-1">
          Drop PDF resume here
        </p>
        <Button variant="ghost" size="sm" className="text-xs">
          Browse Files
        </Button>
        <div className="flex items-center justify-center gap-1 mt-2">
          <AlertTriangle className="w-3 h-3 text-destructive" />
          <span className="text-xs text-destructive">PDF only</span>
        </div>
      </div>
    </div>
  );
};
