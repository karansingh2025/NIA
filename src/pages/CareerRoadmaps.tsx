import { useState } from "react";
import { MessageSquare, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMonochrome } from "../context/MonochromeContext";
import axios from "axios";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";

interface RoadmapSection {
  title: string;
  items: string[];
}

interface Roadmap {
  role: string;
  sections: RoadmapSection[];
}

const ROADMAPS: Roadmap[] = [
  {
    role: "Frontend Developer",
    sections: [
      {
        title: "Foundations",
        items: ["HTML", "CSS", "JavaScript (ES6)", "Git & GitHub"],
      },
      {
        title: "Frameworks",
        items: ["React", "Routing (React Router)", "State (Redux/TanStack)"],
      },
      {
        title: "Styling",
        items: ["TailwindCSS", "Component libraries (shadcn/ui)"],
      },
      { title: "Tooling", items: ["Vite", "ESLint/Prettier", "Vitest/Jest"] },
    ],
  },
  {
    role: "Backend Developer",
    sections: [
      {
        title: "Foundations",
        items: ["Node.js", "TypeScript", "REST APIs", "Auth & JWT"],
      },
      { title: "Databases", items: ["PostgreSQL", "Prisma ORM", "Migrations"] },
      {
        title: "Services",
        items: ["Caching (Redis)", "Queues", "File Uploads"],
      },
      { title: "Ops", items: ["Docker Basics", "CI/CD", "Monitoring"] },
    ],
  },
  {
    role: "Data Scientist",
    sections: [
      {
        title: "Foundations",
        items: ["Python/R", "SQL", "Statistics & Probability"],
      },
      {
        title: "Data Manipulation & Analysis",
        items: ["Pandas", "NumPy", "Data Visualization (Matplotlib, Seaborn)"],
      },
      {
        title: "Machine Learning",
        items: [
          "scikit-learn",
          "Model types (Regression, Classification)",
          "Model Evaluation",
        ],
      },
      {
        title: "Deep Learning",
        items: ["TensorFlow", "PyTorch", "Neural Networks"],
      },
      { title: "Big Data Technologies", items: ["Spark", "Hadoop"] },
    ],
  },
];

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

type Experience = (typeof EXPERIENCE_LEVELS)[number];

// ===== Backend Response Types =====
type RecommendationCategory =
  | "free_courses"
  | "practice_platforms"
  | "project_ideas";

interface FreeCourseItem {
  title: string;
  provider: string;
  estimated_hours?: number;
  cost?: string;
  url?: string;
}

interface PracticePlatformItem {
  title: string;
  description?: string;
  time_commitment?: string;
  cost?: string;
  skill_focus?: string;
}

interface ProjectIdeaItem {
  title: string;
  difficulty: string;
  estimated_hours?: number;
  skills_practiced?: string[];
  portfolio_value?: string;
}

interface RecommendationGroup {
  category: RecommendationCategory;
  priority?: string;
  items: Array<FreeCourseItem | PracticePlatformItem | ProjectIdeaItem>;
}

interface LearningStep {
  step: number;
  title: string;
  description?: string;
  skills_covered?: string[];
  estimated_hours?: number;
  difficulty?: string;
  key_projects?: string[];
  completion_criteria?: string[];
  prerequisites?: string[];
}

interface MilestoneProject {
  title: string;
  description?: string;
  technologies?: string[];
  estimated_hours?: number;
  completion_at?: string;
}

interface TimelineMilestone {
  milestone: string;
  at_hours?: number;
  at_percentage?: number;
  deliverable?: string;
}

interface SchedulingOption {
  pace: string;
  hours_per_day?: number;
  hours_per_week?: number;
  duration: string;
  description?: string;
}

interface RoadmapApiResponse {
  total_hours?: number;
  estimated_duration?: string;
  learning_hours?: number; // sometimes nested under timeline too
  original_input?: string;
  priority?: string;

  roadmap?: {
    buffer_hours?: number;
    learning_path: LearningStep[];
    milestone_projects?: MilestoneProject[];
    total_learning_hours?: number;
  };

  recommendations?: RecommendationGroup[];
  skill_gaps?: string[];
  timeline?: {
    buffer_hours?: number;
    key_milestones?: TimelineMilestone[];
    learning_hours?: number;
    scheduling_options?: SchedulingOption[];
  };
}

export default function CareerRoadmaps() {
  const navigate = useNavigate();
  const { isMonochrome, toggleMonochrome } = useMonochrome();
  const [role, setRole] = useState<string>("Data Scientist");
  const [experience, setExperience] = useState<Experience>("Beginner");
  const [prepTime, setPrepTime] = useState<string>("12"); // interpret as total hours for backend
  const [plan, setPlan] = useState<RoadmapApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const activeRoadmap = ROADMAPS.find((r) => r.role === role) || ROADMAPS[2];

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "AI Chat", path: "/chat" },
    { label: "Roadmaps", path: "/roadmaps" },
    { label: "Resume Analyzer", path: "/resume-analyzer" },
    { label: "Mock Interview", path: "/mock-interview" },
  ];
  const fetchRoadmap = async () => {
    // Adjust endpoint & payload keys to match your backend
    try {
      setLoading(true);
      const { data } = await axios.post<RoadmapApiResponse>(
        "https://roadmap-nia.onrender.com/generate-roadmap",
        {
          target_role: role,
          experience_level: experience,
          total_time: prepTime,
        }
      );
      console.log(data);
      setPlan(data);
    } catch (err) {
      console.error("Failed to fetch roadmap:", err);
    } finally {
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

      <div className="max-w-5xl mx-auto p-6">
        {/* Filters */}
        <Card className="mb-8 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Role */}
            <div>
              <label className="text-sm mb-1 block">Target Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROADMAPS.map((r) => (
                    <SelectItem key={r.role} value={r.role}>
                      {r.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm mb-1 block">Experience</label>
              <Select
                value={experience}
                onValueChange={(v) => setExperience(v as Experience)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Total time */}
            <div>
              <label className="text-sm mb-1 block">Total Time (hours)</label>
              <Input
                type="number"
                min={1}
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={fetchRoadmap} disabled={loading}>
              {loading ? "Generating..." : "Generate Plan"}
            </Button>
          </div>
        </Card>

        {/* Dynamic Plan Rendering */}
        {plan && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    Your Roadmap Summary
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {plan.estimated_duration || "Flexible timeline"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {plan.priority && (
                    <Badge variant="secondary">Priority: {plan.priority}</Badge>
                  )}
                  {plan.total_hours != null && (
                    <Badge>Total Hours: {plan.total_hours}</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Learning Path */}
            {plan.roadmap?.learning_path?.length ? (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Learning Path</h3>
                  <Accordion type="multiple" className="w-full">
                    {plan.roadmap.learning_path.map((s) => (
                      <AccordionItem key={s.step} value={`step-${s.step}`}>
                        <AccordionTrigger className="text-left">
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="font-medium">
                              Step {s.step}: {s.title}
                            </span>
                            <div className="flex items-center gap-2">
                              {s.difficulty && (
                                <Badge variant="secondary">
                                  {s.difficulty}
                                </Badge>
                              )}
                              {s.estimated_hours != null && (
                                <Badge variant="outline">
                                  {s.estimated_hours}h
                                </Badge>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {s.description && (
                              <p className="text-sm text-muted-foreground">
                                {s.description}
                              </p>
                            )}

                            {s.skills_covered?.length ? (
                              <div>
                                <p className="text-sm font-medium mb-2">
                                  Skills Covered
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {s.skills_covered.map((sk) => (
                                    <Badge key={sk} variant="secondary">
                                      {sk}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {s.key_projects?.length ? (
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  Key Projects
                                </p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  {s.key_projects.map((p) => (
                                    <li key={p}>{p}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            {s.completion_criteria?.length ? (
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  Completion Criteria
                                </p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  {s.completion_criteria.map((c) => (
                                    <li key={c}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}

                            {s.prerequisites?.length ? (
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  Prerequisites
                                </p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  {s.prerequisites.map((pr) => (
                                    <li key={pr}>{pr}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </Card>
            ) : null}

            {/* Milestone Projects */}
            {plan.roadmap?.milestone_projects?.length ? (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Milestone Projects
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.roadmap.milestone_projects.map((p) => (
                      <Card key={p.title} className="p-4">
                        <p className="font-medium">{p.title}</p>
                        {p.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {p.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.technologies?.map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                          {p.estimated_hours != null && (
                            <Badge variant="secondary">
                              {p.estimated_hours}h
                            </Badge>
                          )}
                          {p.completion_at && <Badge>{p.completion_at}</Badge>}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            ) : null}

            {/* Timeline & Milestones */}
            {plan.timeline?.key_milestones?.length ? (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Key Milestones</h3>
                  <ul className="space-y-3">
                    {plan.timeline.key_milestones.map((m) => (
                      <li
                        key={m.milestone}
                        className="flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium">{m.milestone}</p>
                          {m.deliverable && (
                            <p className="text-sm text-muted-foreground">
                              {m.deliverable}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {m.at_hours != null && (
                            <Badge variant="outline">{m.at_hours}h</Badge>
                          )}
                          {m.at_percentage != null && (
                            <Badge>{m.at_percentage}%</Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ) : null}

            {/* Scheduling Options */}
            {plan.timeline?.scheduling_options?.length ? (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Scheduling Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.timeline.scheduling_options.map((opt) => (
                      <Card key={opt.pace} className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{opt.pace}</p>
                          <Badge variant="outline">{opt.duration}</Badge>
                        </div>
                        {opt.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {opt.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {opt.hours_per_day != null && (
                            <Badge variant="secondary">
                              {opt.hours_per_day}h/day
                            </Badge>
                          )}
                          {opt.hours_per_week != null && (
                            <Badge variant="secondary">
                              {opt.hours_per_week}h/week
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            ) : null}

            {/* Skill Gaps */}
            {plan.skill_gaps?.length ? (
              <Card>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Skill Gaps</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.skill_gaps.map((g) => (
                      <Badge key={g} variant="secondary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ) : null}

            {/* Recommendations */}
            {plan.recommendations?.length ? (
              <div className="grid grid-cols-1 gap-6">
                {plan.recommendations.map((group, idx) => {
                  const titleMap: Record<RecommendationCategory, string> = {
                    free_courses: "Free / Freemium Courses",
                    practice_platforms: "Practice Platforms",
                    project_ideas: "Project Ideas",
                  };
                  return (
                    <Card key={idx}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold">
                            {titleMap[group.category] || group.category}
                          </h3>
                          {group.priority && (
                            <Badge variant="outline">
                              Priority: {group.priority}
                            </Badge>
                          )}
                        </div>

                        {/* Free Courses */}
                        {group.category === "free_courses" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.items.map((it) => {
                              const item = it as FreeCourseItem;
                              return (
                                <Card key={item.title} className="p-4">
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.provider}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {item.estimated_hours != null && (
                                      <Badge variant="secondary">
                                        {item.estimated_hours}h
                                      </Badge>
                                    )}
                                    {item.cost && (
                                      <Badge variant="outline">
                                        {item.cost}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.url && (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm text-primary underline mt-2 inline-block"
                                    >
                                      Visit course →
                                    </a>
                                  )}
                                </Card>
                              );
                            })}
                          </div>
                        )}

                        {/* Practice Platforms */}
                        {group.category === "practice_platforms" && (
                          <div className="space-y-3">
                            {group.items.map((it) => {
                              const item = it as PracticePlatformItem;
                              return (
                                <div
                                  key={item.title}
                                  className="p-4 border rounded-md bg-card"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">{item.title}</p>
                                    {item.time_commitment && (
                                      <Badge variant="outline">
                                        {item.time_commitment}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {item.cost && (
                                      <Badge variant="secondary">
                                        {item.cost}
                                      </Badge>
                                    )}
                                    {item.skill_focus && (
                                      <Badge variant="outline">
                                        {item.skill_focus}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Project Ideas */}
                        {group.category === "project_ideas" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.items.map((it) => {
                              const item = it as ProjectIdeaItem;
                              return (
                                <Card key={item.title} className="p-4">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">{item.title}</p>
                                    <Badge variant="outline">
                                      {item.difficulty}
                                    </Badge>
                                  </div>
                                  {item.estimated_hours != null && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Estimated: {item.estimated_hours}h
                                    </p>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {item.skills_practiced?.map((sk) => (
                                      <Badge key={sk} variant="secondary">
                                        {sk}
                                      </Badge>
                                    ))}
                                  </div>
                                  {item.portfolio_value && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {item.portfolio_value}
                                    </p>
                                  )}
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
