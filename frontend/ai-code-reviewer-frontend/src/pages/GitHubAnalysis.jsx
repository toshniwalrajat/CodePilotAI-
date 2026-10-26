
import { useState } from "react";
import {
  GitBranch,
  Search,
  LoaderCircle,
  ExternalLink,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Bug,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";

import githubAnalysisService from "../services/githubAnalysisService";

const ANALYSIS_TYPES = [
  {
    value: "FIND_BUGS",
    label: "Find Bugs",
    description: "Identify potential bugs and logic errors",
  },
  {
    value: "REVIEW",
    label: "Code Review",
    description: "Review code quality and best practices",
  },
  {
    value: "EXPLAIN",
    label: "Explain Code",
    description: "Understand the repository's code",
  },
  {
    value: "GENERATE_TESTS",
    label: "Generate Tests",
    description: "Generate test cases for source files",
  },
];

function getErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  if (error.code === "ECONNABORTED") {
    return "The request took too long. Check the backend and LM Studio, then try again.";
  }

  if (!error.response) {
    return "Cannot connect to the backend. Make sure Spring Boot is running on port 8080.";
  }

  return `Analysis failed with HTTP ${error.response.status}. Check your backend logs.`;
}

function getAnalysis(item) {
  return item?.analysis ?? item?.result ?? null;
}

function getSummary(analysis) {
  return analysis?.summary ?? analysis?.explanation?.summary ?? "";
}

function ResultFile({ item, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [copied, setCopied] = useState(false);

  const analysis = getAnalysis(item);
  const findings = analysis?.findings ?? [];
  const fileName =
    item?.fileName ?? item?.filePath ?? `File ${index + 1}`;
  const error = item?.error;
  const summary = getSummary(analysis);
  const suggestedFix = analysis?.suggestedFix;
  const generatedTests = analysis?.generatedTests ?? [];

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-800"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg bg-blue-600/15 p-2 text-blue-400">
            <FileCode2 size={20} />
          </div>

          <div className="min-w-0">
            <p className="break-all text-sm font-semibold text-white">
              {fileName}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {error
                ? "Analysis failed"
                : `${findings.length} finding${findings.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp size={18} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-slate-800 p-4">
          {error && (
            <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!error && !analysis && (
            <p className="text-sm text-slate-400">
              No analysis details were returned for this file.
            </p>
          )}

          {summary && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-white">
                Summary
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {summary}
              </p>
            </section>
          )}

          {findings.length > 0 && (
            <section>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Bug size={16} className="text-blue-400" />
                Findings
              </h4>

              <div className="space-y-3">
                {findings.map((finding, findingIndex) => (
                  <div
                    key={`${finding.lineNumber ?? "line"}-${findingIndex}`}
                    className="rounded-lg border border-slate-700 bg-slate-950/60 p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-amber-800/50 bg-amber-950/50 px-2 py-1 text-xs font-semibold text-amber-300">
                        {finding.severity ?? "INFO"}
                      </span>

                      {finding.lineNumber != null && (
                        <span className="text-xs text-slate-400">
                          Line {finding.lineNumber}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-100">
                      {finding.issue ?? "Finding"}
                    </p>

                    {finding.explanation && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                        {finding.explanation}
                      </p>
                    )}

                    {finding.recommendation && (
                      <p className="mt-2 text-sm leading-6 text-blue-300">
                        <strong>Recommendation:</strong>{" "}
                        {finding.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {suggestedFix && (
            <section>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-white">
                  Suggested Fix
                </h4>

                <button
                  type="button"
                  onClick={() => copyText(suggestedFix)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                {suggestedFix}
              </pre>
            </section>
          )}

          {generatedTests.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-white">
                Generated Tests
              </h4>

              {generatedTests.map((test, testIndex) => (
                <pre
                  key={testIndex}
                  className="mb-2 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-6 text-slate-200"
                >
                  {test}
                </pre>
              ))}
            </section>
          )}

          {analysis?.explanation?.lineByLine?.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-semibold text-white">
                Line-by-Line Explanation
              </h4>

              <div className="space-y-2">
                {analysis.explanation.lineByLine.map((line, lineIndex) => (
                  <div
                    key={`${line.lineNumber}-${lineIndex}`}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <p className="mb-1 text-xs font-semibold text-slate-500">
                      Line {line.lineNumber}
                    </p>

                    <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-blue-300">
                      {line.code}
                    </pre>

                    <p className="mt-2 text-sm text-slate-400">
                      {line.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {analysis &&
            !summary &&
            findings.length === 0 &&
            !suggestedFix &&
            generatedTests.length === 0 && (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-blue-400">
                  View complete analysis response
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
                  {JSON.stringify(analysis, null, 2)}
                </pre>
              </details>
            )}
        </div>
      )}
    </article>
  );
}

export default function GitHubAnalysis() {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [analysisType, setAnalysisType] = useState("FIND_BUGS");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const url = repositoryUrl.trim();

    const validUrl =
      /^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+\/?$/.test(
        url
      );

    if (!validUrl) {
      setError(
        "Enter a valid URL, such as https://github.com/toshniwalrajat/BankAccountAPi"
      );
      return;
    }

    try {
      setLoading(true);

      const data = await githubAnalysisService.analyzeRepository(
        url,
        analysisType
      );

      setResult(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const files = result?.files ?? [];
  const filesAnalyzed = result?.filesAnalyzed ?? 0;
  const filesFailed = result?.filesFailed ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-200 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <div className="mb-3 flex items-center gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-blue-400">
              <GitBranch size={27} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                GitHub Repository Analysis
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Analyze repository source code with your AI assistant.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/10 sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Connect a Repository
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter the URL of a public GitHub repository.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="repositoryUrl"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                GitHub Repository URL
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <GitBranch
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="repositoryUrl"
                    type="url"
                    required
                    value={repositoryUrl}
                    onChange={(event) =>
                      setRepositoryUrl(event.target.value)
                    }
                    placeholder="https://github.com/owner/repository"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <a
                  href="https://github.com/toshniwalrajat/BankAccountAPi"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                >
                  Example Repo
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>

            <div>
              <label
                htmlFor="analysisType"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Analysis Type
              </label>

              <select
                id="analysisType"
                value={analysisType}
                onChange={(event) => setAnalysisType(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {ANALYSIS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} — {type.description}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Analyzing Repository...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Analyze Repository
                  <Sparkles size={17} />
                </>
              )}
            </button>

            {loading && (
              <p className="text-sm leading-6 text-slate-400">
                Downloading repository and analyzing files. This may take a
                few minutes depending on the repository size and local AI
                model.
              </p>
            )}
          </form>
        </section>

        {result && (
          <section className="space-y-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Analysis Results
                </h2>
                <p className="mt-1 break-all text-sm text-slate-400">
                  {result.repositoryName ?? "GitHub Repository"}
                </p>
              </div>

              <a
                href={repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                Open Repository
                <ExternalLink size={15} />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Files Analyzed"
                value={filesAnalyzed}
                icon={<FileCode2 size={20} />}
                color="blue"
              />

              <StatCard
                label="Files Failed"
                value={filesFailed}
                icon={<AlertCircle size={20} />}
                color="red"
              />

              <StatCard
                label="Analysis Type"
                value={result.analysisType ?? analysisType}
                icon={<CheckCircle2 size={20} />}
                color="emerald"
              />
            </div>

            {files.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-white">
                  Analyzed Files ({files.length})
                </h3>

                {files.map((item, index) => (
                  <ResultFile
                    key={`${
                      item.fileName ?? item.filePath ?? "file"
                    }-${index}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
                The backend returned no file results. Check the response
                and confirm the repository contains supported source files.
              </div>
            )}

            {result.createdAt && (
              <p className="text-xs text-slate-500">
                Analysis created:{" "}
                {String(result.createdAt).replace("T", " ")}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-600/15 text-blue-400",
    red: "bg-red-500/10 text-red-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{label}</p>
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-3 break-words text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}
