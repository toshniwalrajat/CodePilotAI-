
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  FileCode2,
  FolderGit2,
  GitBranch,
  History,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

const overviewCards = [
  {
    title: "Total Analyses",
    value: "—",
    description: "Connect analysis history to see totals",
    icon: Code2,
    color: "text-blue-400",
    background: "bg-blue-500/10",
  },
  {
    title: "Files Reviewed",
    value: "—",
    description: "Tracked through analysis results",
    icon: FileCode2,
    color: "text-violet-400",
    background: "bg-violet-500/10",
  },
  {
    title: "Repositories",
    value: "—",
    description: "ZIP and GitHub analyses",
    icon: FolderGit2,
    color: "text-emerald-400",
    background: "bg-emerald-500/10",
  },
  {
    title: "Code Quality",
    value: "—",
    description: "Based on actual review findings",
    icon: ShieldCheck,
    color: "text-amber-400",
    background: "bg-amber-500/10",
  },
];

const quickActions = [
  {
    title: "Analyze Code",
    description: "Explain code, find bugs, or review quality.",
    path: "/code-analysis",
    icon: Code2,
    color: "text-blue-400",
    background: "bg-blue-500/10",
  },
  {
    title: "Upload a File",
    description: "Review a supported source-code file.",
    path: "/file-analysis",
    icon: FileCode2,
    color: "text-violet-400",
    background: "bg-violet-500/10",
  },
  {
    title: "Analyze Repository",
    description: "Upload a ZIP of your source code.",
    path: "/repository-analysis",
    icon: FolderGit2,
    color: "text-emerald-400",
    background: "bg-emerald-500/10",
  },
  {
    title: "Connect GitHub",
    description: "Analyze a public GitHub repository.",
    path: "/github-analysis",
    icon: GitBranch,
    color: "text-orange-400",
    background: "bg-orange-500/10",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
            <Sparkles size={14} />
            AI-powered developer workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome to CodePilot AI
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Understand your code, identify potential bugs, improve code
            quality, and generate unit tests with your AI coding assistant.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/code-analysis"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Start Code Analysis
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              View History
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Workspace Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your analysis metrics will appear here when connected.
            </p>
          </div>
          <Zap size={20} className="text-blue-400" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <div className={`rounded-xl p-2.5 ${card.background}`}>
                    <Icon size={20} className={card.color} />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-bold text-white">
                  {card.value}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose what you want to analyze.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.path}
                to={action.path}
                className="group flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-slate-900"
              >
                <div className={`rounded-xl p-3 ${action.background}`}>
                  <Icon size={23} className={action.color} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {action.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-slate-500 transition group-hover:text-blue-400"
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between border-b border-slate-800 p-5 sm:p-6">
          <div>
            <h2 className="font-semibold text-white">Recent Activity</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your saved code analysis history.
            </p>
          </div>

          <Link
            to="/history"
            className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex flex-col items-center px-5 py-12 text-center">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <History size={28} className="text-slate-500" />
          </div>

          <h3 className="mt-4 font-semibold text-white">
            Your workspace is ready
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Once you run your first code analysis, your saved results can
            appear here.
          </p>

          <Link
            to="/code-analysis"
            className="mt-5 text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            Run your first analysis →
          </Link>
        </div>
      </section>
    </div>
  );
}
