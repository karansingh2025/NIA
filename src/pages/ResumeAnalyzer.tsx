import {
  Lightbulb,
  BookOpen,
  Users,
  ClipboardCheck,
  Star,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMonochrome } from "../context/MonochromeContext";
import { useRef, useState } from "react";
import axios from "axios";
import { set } from "react-hook-form";

const CoursePill = ({
  level,
}: {
  level: "Beginner" | "Intermediate" | "Advanced";
}) => (
  <span
    className={`text-xs px-2 py-0.5 rounded-full border mr-2 ${
      level === "Beginner"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : level === "Intermediate"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-sky-50 text-sky-700 border-sky-200"
    }`}
  >
    {level}
  </span>
);

const CourseCard = ({
  title,
  level,
  provider,
}: {
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  provider: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center gap-2">
        {title}
        <CoursePill level={level} />
      </CardTitle>
      <CardDescription>{provider}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full">
        View Course →
      </Button>
    </CardContent>
  </Card>
);

const MentorCard = ({ name, role }: { name: string; role: string }) => (
  <div className="flex items-center justify-between p-3 border rounded-md bg-card">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
    </div>
    <div className="flex items-center gap-1 text-amber-500">
      <Star className="w-4 h-4 fill-current" />
      <Star className="w-4 h-4 fill-current" />
      <Star className="w-4 h-4 fill-current" />
      <Star className="w-4 h-4 fill-current" />
      <Star className="w-4 h-4" />
    </div>
  </div>
);

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const { isMonochrome, toggleMonochrome } = useMonochrome();
  const [loading, setLoading] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "AI Chat", path: "/chat" },
    { label: "Roadmaps", path: "/roadmaps" },
    { label: "Resume Analyzer", path: "/resume-analyzer" },
    { label: "Mock Interview", path: "/mock-interview" },
  ];

  const [resumeSuggestion, setResumeSuggestion] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onResumeSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Accept only PDFs
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      console.warn("Please upload a PDF file.");
      e.target.value = "";
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const resp = await axios.post(
        "https://nia-voice-mentor-1.onrender.com/analyze-resume",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log(resp);
      const summary = resp?.data?.analysis || resp?.data?.message || "";
      if (summary) setResumeSuggestion(summary);
    } catch (err) {
      console.error("Resume analysis failed:", err);
    } finally {
      e.target.value = "";
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NIA</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Theme Toggle and Mobile Menu */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
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

                {/* Mobile menu button */}
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

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Title */}
        {/* <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-1">Resume Analyzer</h2>
        </div> */}

        {/* Suggested Career Path */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sky-600">
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm font-medium">Resume Suggestions</span>
            </div>{" "}
            <CardTitle className="text-xl text-primary"></CardTitle>
            {resumeSuggestion.length > 0 ? (
              <CardDescription className="text-semibold text-md">
                {resumeSuggestion}
              </CardDescription>
            ) : (
              <div className="flex items-center justify-center w-full p-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={onResumeSelected}
                />
                <button
                  className="bg-black text-white text-sm font-semibold p-1 rounded-md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {loading ? "Analyzing..." : "Choose Resume"}
                </button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Recommended Courses */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sky-600">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Recommended Courses</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CourseCard
                title="Advanced JavaScript"
                level="Intermediate"
                provider="Coursera"
              />
              <CourseCard
                title="React for Beginners"
                level="Beginner"
                provider="Udemy"
              />
              <CourseCard
                title="Python for Data Science"
                level="Intermediate"
                provider="DataCamp"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mentor + Skills Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sky-600">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Find a Mentor</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <MentorCard name="Alison Hsu" role="Senior Engineer @ SpaceX" />
              <MentorCard name="Ravi Williams" role="Staff Engineer @ Meta" />
              <Button variant="outline" className="w-full">
                View All Mentors
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sky-600">
                <ClipboardCheck className="w-4 h-4" />
                <span className="text-sm font-medium">Skills Assessment</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Validate your skills and identify gaps.
              </p>
              <Button className="w-full">Start Assessment</Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-center">
          <Button
            onClick={() => setResumeSuggestion("")}
            variant="ghost"
            size="sm"
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
