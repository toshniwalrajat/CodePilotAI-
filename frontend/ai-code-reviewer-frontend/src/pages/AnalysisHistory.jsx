
import { useCallback, useEffect, useState } from "react";
import {
  History,
  Search,
  RefreshCw,
  FileCode2,
  FolderGit2,
  GitBranch,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const FILTERS = [
  { label: "All Analyses", value: "ALL" },
  { label: "Code Review", value: "REVIEW" },
  { label: "Find Bugs", value: "FIND_BUGS" },
  { label: "Explain Code", value: "EXPLAIN" },
  { label: "Generate Tests", value: "GENERATE_TESTS" },
];

function formatDate(dateValue) {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleString();
}

function getAnalysisLabel(type) {
  return (
    FILTERS.find((filter) => filter.value === type)?.label ||
    type?.replaceAll("_", " ") ||
    "Analysis"
  );
}

export default function AnalysisHistory() {
  const [analyses, setAnalyses] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/analysis/history");
      const data = response.data;

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.analyses)
            ? data.analyses
            : Array.isArray(data?.data)
              ? data.data
              : null;

      if (!records) {
        throw new Error(
          "The history API did not return a list. Check its response format."
        );
      }

      setAnalyses(records);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to load analysis history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  const filteredAnalyses = analyses.filter((item) => {
    const type = item.analysisType || item.type || "";

    const name =
      item.repositoryName ||
      item.fileName ||
      item.name ||
      item.sourceName ||
      "Code analysis";

    const matchesFilter = filter === "ALL" || type === filter;

    const matchesSearch = `${name} ${type} ${item.id ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const reviewCount = analyses.filter(
    (item) => (item.analysisType || item.type) === "REVIEW"
  ).length;

  const bugCount = analyses.filter(
    (item) => (item.analysisType || item.type) === "FIND_BUGS"
  ).length;

  return (
    <div className="min-h-full bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-blue-400">
              <History className="h-4 w-4" />
              <span>Workspace / Analysis History</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Analysis History
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Browse and revisit your previous code analysis results.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500/50 hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Total Analyses</p>
            <p className="mt-3 text-3xl font-bold text-white">
              {loading ? "—" : analyses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Code Reviews</p>
            <p className="mt-3 text-3xl font-bold text-blue-400">
              {loading ? "—" : reviewCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Bug Analyses</p>
            <p className="mt-3 text-3xl font-bold text-amber-400">
              {loading ? "—" : bugCount}
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by repository, file, or type..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    filter === item.value
                      ? "bg-blue-600 text-white"
                      : "border border-slate-700 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

              <div>
                <h2 className="font-semibold text-amber-300">
                  Could not load analysis history
                </h2>

                <p className="mt-2 break-words text-sm leading-6 text-slate-300">
                  {error}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Check that your backend provides GET
                  /api/analysis/history and returns saved analysis records.
                </p>

                <button
                  type="button"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {!error && loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-400" />
            <p className="mt-4 text-sm text-slate-400">
              Loading saved analyses...
            </p>
          </div>
        )}

        {/* Analysis records */}
        {!error && !loading && filteredAnalyses.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 className="font-semibold text-white">
                Previous Analyses
              </h2>

              <span className="text-xs text-slate-500">
                {filteredAnalyses.length} result(s)
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {filteredAnalyses.map((item, index) => {
                const name =
                  item.repositoryName ||
                  item.fileName ||
                  item.name ||
                  item.sourceName ||
                  "Code analysis";

                const type = item.analysisType || item.type;
                const isRepository = Boolean(item.repositoryName);
                const isGitHub = Boolean(
                  item.repositoryUrl || item.githubUrl
                );

                return (
                  <div
                    key={item.id ?? `${name}-${index}`}
                    className="flex flex-col justify-between gap-4 px-5 py-5 transition hover:bg-slate-800/30 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                        {isGitHub ? (
                          <GitBranch className="h-5 w-5 text-blue-400" />
                        ) : isRepository ? (
                          <FolderGit2 className="h-5 w-5 text-blue-400" />
                        ) : (
                          <FileCode2 className="h-5 w-5 text-blue-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-all font-medium text-slate-100">
                          {name}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
                            {getAnalysisLabel(type)}
                          </span>

                          {item.id != null && (
                            <span className="text-xs text-slate-500">
                              ID: {item.id}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {formatDate(
                            item.createdAt ||
                              item.createdDate ||
                              item.timestamp
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Saved result
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!error && !loading && filteredAnalyses.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
              <History className="h-7 w-7 text-slate-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              {analyses.length === 0
                ? "No saved analyses yet"
                : "No matching analyses"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {analyses.length === 0
                ? "Run a code, file, repository, or GitHub analysis. Saved results will appear here once your backend stores and exposes them."
                : "Try another search term or select a different analysis type."}
            </p>

            {analyses.length === 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/code-analysis"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Analyze Code
                </Link>

                <Link
                  to="/repository-analysis"
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  Analyze Repository
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
