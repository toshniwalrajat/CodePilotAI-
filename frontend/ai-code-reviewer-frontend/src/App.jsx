
import { Routes, Route, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CodeAnalysis from "./pages/CodeAnalysis";
import FileAnalysis from "./pages/FileAnalysis";
import RepositoryAnalysis from "./pages/RepositoryAnalysis";
import GitHubAnalysis from "./pages/GitHubAnalysis";
import AnalysisHistory from "./pages/AnalysisHistory";

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h1 className="text-4xl font-bold text-blue-400">404</h1>
      </div>

      <h2 className="mt-5 text-2xl font-bold text-white">
        Page Not Found
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
        The page you're looking for doesn't exist or may have moved.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-slate-800"
      >
        <ArrowLeft size={16} />
        Return to Dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Code Analysis */}
        <Route
          path="code-analysis"
          element={<CodeAnalysis />}
        />

        {/* File Analysis */}
        <Route
          path="file-analysis"
          element={<FileAnalysis />}
        />

        {/* Repository ZIP Analysis */}
        <Route
          path="repository-analysis"
          element={<RepositoryAnalysis />}
        />

        {/* GitHub Repository Analysis */}
        <Route
          path="github-analysis"
          element={<GitHubAnalysis />}
        />

        {/* Analysis History */}
        <Route
          path="history"
          element={<AnalysisHistory />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
