import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import Index from "./pages/Index.tsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.tsx";
import CareerRoadmaps from "./pages/CareerRoadmaps.tsx";
import MockInterview from "./pages/MockInterview.tsx";
import NotFound from "./pages/NotFound";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { MonochromeProvider } from "./context/MonochromeContext.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MonochromeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<Index />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/roadmaps" element={<CareerRoadmaps />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MonochromeProvider>
  </QueryClientProvider>
);

export default App;
