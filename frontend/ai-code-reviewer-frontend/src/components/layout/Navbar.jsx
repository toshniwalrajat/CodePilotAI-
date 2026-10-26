import { Bell, Menu, Search, UserRound } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
          <span>Workspace</span>
          <span>/</span>
          <span className="font-medium text-slate-200">Overview</span>
        </div>

        <h2 className="truncate text-sm font-semibold text-white sm:hidden">
          CodePilot AI
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="relative hidden md:block">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            placeholder="Search workspace..."
            aria-label="Search workspace"
            className="w-56 rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 lg:w-72"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-800 pl-3 sm:pl-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
            <UserRound size={19} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">Developer</p>
            <p className="text-xs text-slate-500">Local workspace</p>
          </div>
        </div>
      </div>
    </header>
  );
}