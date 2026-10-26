
import {
  LayoutDashboard,
  Code2,
  FileCode2,
  FolderGit2,
  GitBranch,
  History,
  Bug,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Code Analysis",
    path: "/code-analysis",
    icon: Code2,
  },
  {
    name: "File Analysis",
    path: "/file-analysis",
    icon: FileCode2,
  },
  {
    name: "Repository Analysis",
    path: "/repository-analysis",
    icon: FolderGit2,
  },
  {
    name: "GitHub Analysis",
    path: "/github-analysis",
    icon: GitBranch,
  },
  {
    name: "Analysis History",
    path: "/history",
    icon: History,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo and branding */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Bug size={23} />
            </div>

            <div>
              <h1 className="text-base font-bold text-white">
                CodePilot AI
              </h1>
              <p className="text-xs text-slate-500">
                Code Review Assistant
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 hover:bg-slate-800 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    isActive
                      ? "bg-blue-600/15 font-semibold text-blue-400"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer information */}
        <div className="mt-auto border-t border-slate-800 p-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-semibold text-white">
              AI-powered reviews
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Understand code, find bugs, and improve code quality.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Local AI workspace
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
