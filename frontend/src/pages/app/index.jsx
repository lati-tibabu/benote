import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Footer } from "@shared/components/layout";
import {
  PiBellRinging,
  PiBrain,
  PiCalendarCheck,
  PiChatsCircle,
  PiCheckCircle,
  PiClockCountdown,
  PiFiles,
  PiFlowArrow,
  PiKanban,
  PiLightning,
  PiTarget,
  PiUsersThree,
} from "react-icons/pi";

const features = [
  {
    icon: PiKanban,
    title: "Task command board",
    description:
      "Track priorities, deadlines, and progress in one focused workspace.",
  },
  {
    icon: PiBrain,
    title: "AI work assistant",
    description:
      "Generate plans, summarize notes, and break down projects instantly.",
  },
  {
    icon: PiUsersThree,
    title: "Team collaboration",
    description:
      "Share resources, assign tasks, and keep everyone aligned in real time.",
  },
  {
    icon: PiFiles,
    title: "Smart notes and docs",
    description:
      "Convert files to structured notes and chat with your content.",
  },
  {
    icon: PiBellRinging,
    title: "Signal over noise",
    description:
      "Actionable notifications designed to keep focus, not interrupt it.",
  },
  {
    icon: PiCalendarCheck,
    title: "Study and sprint plans",
    description:
      "Build adaptive study plans and execution blocks that actually stick.",
  },
];

const metricCards = [
  { label: "Projects in motion", value: "12", icon: PiTarget },
  { label: "Tasks completed this week", value: "43", icon: PiCheckCircle },
  { label: "Focus sessions", value: "18", icon: PiClockCountdown },
  { label: "Team responses", value: "97%", icon: PiChatsCircle },
];

const workflowPhases = [
  {
    title: "Capture",
    copy: "Drop ideas, tasks, documents, and meeting context the moment they happen.",
  },
  {
    title: "Prioritize",
    copy: "Let AI and deadline awareness shape a realistic execution order.",
  },
  {
    title: "Execute",
    copy: "Work in deep-focus blocks with clear status and ownership.",
  },
  {
    title: "Reflect",
    copy: "Review outcomes, velocity, and signals to sharpen tomorrow's plan.",
  },
];

const stories = [
  {
    title: "Students",
    summary: "Turn assignments and notes into a weekly game plan.",
  },
  {
    title: "Teams",
    summary: "Move from noisy chats to clear accountability and delivery.",
  },
  {
    title: "Solo builders",
    summary: "Keep strategy, execution, and learning loops in one workspace.",
  },
];

function RevealSection({ children, className = "", delay = 0, id }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 700ms ease ${delay}ms, transform 700ms ease ${delay}ms`,
      }}
    >
      {children}
    </section>
  );
}

RevealSection.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  id: PropTypes.string,
};

function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      const phaseNodes = Array.from(document.querySelectorAll("[data-phase]"));
      const marker = window.scrollY + window.innerHeight * 0.4;
      let current = 0;

      phaseNodes.forEach((node, idx) => {
        if (node.offsetTop <= marker) {
          current = idx;
        }
      });

      setActivePhase(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900"
      style={{ fontFamily: "'Sora', 'Manrope', 'Segoe UI', sans-serif" }}
    >
      <div className="fixed left-0 top-0 z-[60] h-1 bg-slate-700" style={{ width: `${scrollProgress}%` }} />

      <div className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <div className="pointer-events-auto border border-slate-200 bg-white/95 p-2 shadow-sm">
          {workflowPhases.map((phase, idx) => (
            <button
              key={phase.title}
              type="button"
              className={`mb-1 block w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.15em] ${
                activePhase === idx ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
              }`}
              onClick={() => {
                const target = document.querySelector(`[data-phase="${idx}"]`);
                if (target) {
                  target.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
            >
              {phase.title}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-[-10%] h-96 w-96 bg-cyan-200/60 blur-3xl" />
          <div className="absolute top-24 right-[-8%] h-[28rem] w-[28rem] bg-emerald-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 bg-sky-200/50 blur-3xl" />
        </div>

        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/rect19.png" alt="Benote logo" className="h-10 w-10" />
            <span className="text-lg font-semibold tracking-wide">Benote</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/auth/login"
              className="border border-slate-300 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              to="/auth/signup"
              className="bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start free
            </Link>
          </div>
        </header>

        <RevealSection className="relative mx-auto grid min-h-[85vh] w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8" id="hero">
          <div className="flex flex-col justify-center">
            <h1 className="text-balance text-5xl font-semibold leading-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Build momentum every day, not just plans.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
              Benote turns scattered tasks, deadlines, notes, and team chats into one
              clear operating system that helps you execute with confidence.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/auth/signup"
                className="inline-flex items-center gap-2 bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Launch workspace <PiFlowArrow />
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 border border-slate-300 bg-white px-6 py-4 text-base font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Continue where you left off
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3">
              {metricCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Icon />
                    <span className="text-xs uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="border border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-200 backdrop-blur-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Live execution dashboard</p>
                  <p className="text-xs text-slate-500">Visitor preview experience</p>
                </div>
                <span className="bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                  Auto-updating
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Finalize roadmap draft", status: "In progress", tone: "cyan" },
                  { label: "Review assignment backlog", status: "Due soon", tone: "amber" },
                  { label: "Sync with workspace team", status: "Scheduled", tone: "emerald" },
                ].map((item) => (
                  <div key={item.label} className="border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold ${
                          item.tone === "cyan"
                            ? "bg-slate-200 text-slate-700"
                            : item.tone === "amber"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">AI Suggestion</p>
                  <p className="mt-1 text-sm text-slate-700">Block 45m for deep work before chat.</p>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Team Signal</p>
                  <p className="mt-1 text-sm text-slate-700">2 mentions need your response.</p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </div>

      <RevealSection className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" id="capabilities" delay={100}>
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Capabilities</p>
            <h2 className="mt-2 text-4xl font-semibold text-slate-900 sm:text-5xl">
              A longer journey visitors can feel while they scroll
            </h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500 sm:text-base">
            Every section reveals exactly how Benote transforms messy workdays into clear execution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, idx) => (
            <article
              key={title}
              className="group border border-slate-200 bg-white/90 p-6 transition hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg"
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              <div className="mb-4 inline-flex bg-slate-200 p-2 text-slate-700 transition group-hover:bg-slate-300">
                <Icon size={22} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" id="workflow" delay={120}>
        <div className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Interactive Flow</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Scroll through the productivity loop
          </h3>
          <p className="mt-3 max-w-3xl text-base text-slate-600">
            As you continue scrolling, each phase becomes active. This mirrors how teams and individuals move from intention to impact with Benote.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {workflowPhases.map((phase, idx) => (
              <div
                key={phase.title}
                data-phase={idx}
                className={`border p-5 transition-all duration-300 ${
                  activePhase === idx
                    ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                    : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">Phase {idx + 1}</div>
                <h4 className="mt-2 text-2xl font-semibold">{phase.title}</h4>
                <p className="mt-2 text-sm leading-relaxed opacity-90">{phase.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8" id="stories" delay={140}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {stories.map((story, idx) => (
            <article key={story.title} className="border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Use case {idx + 1}</p>
              <h4 className="mt-2 text-2xl font-semibold text-slate-900">{story.title}</h4>
              <p className="mt-2 text-base text-slate-600">{story.summary}</p>
              <div className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-500">
                &quot;Benote gave us structure without slowing us down.&quot;
              </div>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" id="cta" delay={160}>
        <div className="border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Ready to turn visitors into builders?
              </h3>
              <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
                Create your workspace, invite your team, and watch your planning rhythm become execution momentum.
              </p>
            </div>
            <Link
              to="/auth/signup"
              className="inline-flex w-full items-center justify-center gap-2 bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              Create your workspace <PiLightning />
            </Link>
          </div>
        </div>
      </RevealSection>

      <Footer />
    </div>
  );
}

export default Home;
