import { Link } from "react-router-dom";
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
  PiSparkle,
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

function Home() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      style={{ fontFamily: "'Sora', 'Manrope', 'Segoe UI', sans-serif" }}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute top-24 right-[-8%] h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        </div>

        <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/rect19.png" alt="Benote logo" className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-semibold tracking-wide">Benote</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/auth/login"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Log in
            </Link>
            <Link
              to="/auth/signup"
              className="rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Start free
            </Link>
          </div>
        </header>

        <section className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-12">
          <div className="flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <PiSparkle /> Productivity Suite
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              One command center for focused work, study, and collaboration.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
              Benote combines planning, execution, AI support, notes, and team sync
              in a single workspace designed for deep productivity.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Launch workspace <PiFlowArrow />
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/70 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Continue where you left off
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
              {metricCards.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Icon />
                    <span className="text-xs uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-2xl shadow-cyan-900/30 backdrop-blur-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <p className="text-sm font-semibold text-white">Today&apos;s execution panel</p>
                  <p className="text-xs text-slate-400">Friday sprint view</p>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                  Focus mode
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Finalize roadmap draft", status: "In progress", tone: "cyan" },
                  { label: "Review class assignments", status: "Due soon", tone: "amber" },
                  { label: "Sync with workspace team", status: "Scheduled", tone: "emerald" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-100">{item.label}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.tone === "cyan"
                            ? "bg-cyan-400/20 text-cyan-300"
                            : item.tone === "amber"
                            ? "bg-amber-400/20 text-amber-300"
                            : "bg-emerald-400/20 text-emerald-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">AI Suggestion</p>
                  <p className="mt-1 text-sm text-slate-200">
                    Block 45m for deep work before opening chat.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Team Signal</p>
                  <p className="mt-1 text-sm text-slate-200">
                    2 mentions need your response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Capabilities
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Built for serious productivity workflows
            </h2>
          </div>
          <p className="hidden max-w-sm text-right text-sm text-slate-400 md:block">
            From individual focus to coordinated team execution, everything lives in
            one coherent operating layer.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-900/20"
            >
              <div className="mb-4 inline-flex rounded-lg bg-slate-800 p-2 text-cyan-300 transition group-hover:bg-cyan-400/20">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                Ready to run your day like a productivity suite?
              </h3>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Start free and move your tasks, notes, and team workflows into one system.
              </p>
            </div>
            <Link
              to="/auth/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 sm:w-auto"
            >
              Create your workspace <PiLightning />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
