import {
  MessageSquare,
  GraduationCap,
  FileText,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { useMonochrome } from "../context/MonochromeContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { isMonochrome, toggleMonochrome } = useMonochrome();

  const features = [
    {
      icon: MessageSquare,
      title: "AI Chat Guidance",
      description:
        "Get personalized advice on your education and career path from our AI.",
      path: "/chat",
    },
    {
      icon: GraduationCap,
      title: "Career Roadmaps",
      description:
        "Explore detailed roadmaps for various careers to guide your journey.",
      path: "/roadmaps",
    },
    {
      icon: FileText,
      title: "AI Resume Analyzer",
      description:
        "Upload your resume for an in-depth analysis and improvement tips.",
      path: "/resume-analyzer",
    },
    {
      icon: Users,
      title: "Mock Interviews",
      description:
        "Practice for your next interview with our simulator and get ready to shine.",
      path: "/mock-interview",
    },
  ];

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "AI Chat", path: "/chat" },
    { label: "Roadmaps", path: "/roadmaps" },
    { label: "Resume Analyzer", path: "/resume-analyzer" },
    { label: "Mock Interview", path: "/mock-interview" },
  ];

  return (
    <div className="bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NIA</span>
            </div>

            <div className="flex items-center gap-4                                                                                                                                                                                                                                                                                 ">
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

      {/* Hero Section */}
      <section className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Unlock Your Career Potential with NIA
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your AI-powered ally for navigating education and career choices
            with confidence.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="relative overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-base mb-6">
                      {feature.description}
                    </CardDescription>
                    <Button
                      onClick={() => navigate(feature.path)}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
                    >
                      Get Started
                      <span className="ml-2">→</span>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default HomePage;
