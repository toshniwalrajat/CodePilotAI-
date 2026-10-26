
import { useRef, useState } from "react";
import {
  FolderGit2,
  Upload,
  FileArchive,
  X,
  LoaderCircle,
  Sparkles,
  ShieldCheck,
  Bug,
  FlaskConical,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";

import api from "../services/api";

const ANALYSIS_TYPES = [
  {
    value: "REVIEW",
    label: "Code Review",
    description: "Review code quality, best practices, and maintainability.",
    icon: ShieldCheck,
  },
  {
    value: "FIND_BUGS",
    label: "Find Bugs",
    description: "Find likely bugs, errors, and potential edge cases.",
    icon: Bug,
  },
  {
    value: "EXPLAIN",
    label: "Explain Code",
    description: "Understand the purpose and flow of the source code.",
    icon: BookOpen,
  },
  {
    value: "GENERATE_TESTS",
    label: "Generate Tests",
    description: "Generate unit test suggestions for analyzed code.",
    icon: FlaskConical,
  },
];

function getStatusColor(hasError) {
  return hasError
    ? "border-red-500/20 bg-red-500/10 text-red-300"
    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
}

function ResultCard({ file, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [copied, setCopied] = useState(false);

  const analysis = file.analysis;
  const hasError = Boolean(file.error);
  const fileName = file.fileName || `Source file ${index + 1}`;

  const analysisText =
    analysis?.analysis ??
    analysis?.review ??
    analysis?.explanation ??
    analysis?.result ??
    analysis?.content ??
    analysis?.response ??
    analysis?.message ??
    "";

  const findings = Array.isArray(analysis?.findings)
    ? analysis.findings
    : Array.isArray(analysis?.issues)
      ? analysis.issues
      : [];

  const suggestedFix = analysis?.suggestedFix ?? analysis?.fix ?? "";
  const generatedTests =
    analysis?.generatedTests ?? analysis?.testCode ?? "";

  async function copyResult() {
    const textToCopy = [
      `File: ${fileName}`,
      analysisText,
      findings.length
        ? `Findings:\n${findings
            .map((finding) =>
              typeof finding === "string"
                ? finding
                : JSON.stringify(finding, null, 2)
            )
            .join("\n")}`
        : "",
      suggestedFix ? `Suggested Fix:\n${suggestedFix}` : "",
      generatedTests ? `Generated Tests:\n${generatedTests}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <button
        type="button"
        onClick={() => setExpanded((previous) => !previous)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-800/40 sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
            <FileCode2 className="h-5 w-5 text-blue-400" />
          </div>

          <div className="min-w-0">
            <p className="break-all font-medium text-slate-100">
              {fileName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${getStatusColor(
                  hasError
                )}`}
              >
                {hasError ? "Failed" : "Analyzed"}
              </span>
              {analysis?.language && (
                <span className="text-xs text-slate-500">
                  {analysis.language}
                </span>
              )}
            </div>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-slate-800 p-4 sm:p-5">
          {hasError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 font-medium text-red-300">
                <AlertCircle className="h-4 w-4" />
                Analysis failed for this file
              </div>
              <p className="mt-2 break-words text-sm leading-6 text-slate-300">
                {file.error}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-100">
                  Analysis Results
                </h3>
                <button
                  type="button"
                  onClick={copyResult}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500/50 hover:text-white"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy results"}
                </button>
              </div>

              {analysisText ? (
                <div className="whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-7 text-slate-300">
                  {analysisText}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No general analysis text was returned for this file.
                  Check the structured findings below if available.
                </p>
              )}

              {findings.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Bug className="h-4 w-4 text-amber-400" />
                    Findings ({findings.length})
                  </h4>
                  <div className="space-y-3">
                    {findings.map((finding, findingIndex) => (
                      <div
                        key={findingIndex}
                        className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                      >
                        {typeof finding === "string" ? (
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                            {finding}
                          </p>
                        ) : (
                          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-300">
                            {JSON.stringify(finding, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {suggestedFix && (
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-200">
                    Suggested Fix
                  </h4>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs leading-6 text-emerald-200">
                    {suggestedFix}
                  </pre>
                </div>
              )}

              {generatedTests && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <FlaskConical className="h-4 w-4 text-purple-400" />
                    Generated Tests
                  </h4>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-xs leading-6 text-purple-200">
                    {generatedTests}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function RepositoryAnalysis() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [analysisType, setAnalysisType] = useState("REVIEW");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function validateFile(selectedFile) {
    if (!selectedFile) return "Please select a ZIP file.";

    if (!selectedFile.name.toLowerCase().endsWith(".zip")) {
      return "Only ZIP files are supported.";
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      return "The ZIP file must be 5 MB or smaller.";
    }

    if (selectedFile.size === 0) {
      return "The selected ZIP file is empty.";
    }

    return "";
  }

  function selectFile(selectedFile) {
    const validationError = validateFile(selectedFile);

    setError(validationError);
    setResult(null);

    if (validationError) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) selectFile(selectedFile);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) selectFile(droppedFile);
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    if (!file) {
      setError("Please upload a ZIP file before starting the analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("analysisType", analysisType);

      const response = await api.post(
        "/api/analysis/repository",
        formData
      );

      setResult(response.data);
    } catch (err) {
      const responseMessage = err.response?.data;

      setError(
        typeof responseMessage === "string"
          ? responseMessage
          : responseMessage?.message ||
              responseMessage?.error ||
              err.message ||
              "Repository analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetAnalysis() {
    setFile(null);
    setResult(null);
    setError("");
    setAnalysisType("REVIEW");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const analyzedFiles = result?.files || [];
  const successCount = analyzedFiles.filter(
    (item) => !item.error
  ).length;
  const failedCount = analyzedFiles.filter(
    (item) => item.error
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-blue-400">
              <FolderGit2 className="h-4 w-4" />
              <span>CodePilot AI / Repository Analysis</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Repository Analysis
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Upload a ZIP archive of your project and use AI to review
              its source files, identify potential bugs, explain code,
              or generate test suggestions.
            </p>
          </div>

          {result && (
            <button
              type="button"
              onClick={resetAnalysis}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/50 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              New Analysis
            </button>
          )}
        </div>

        {/* Feature cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Code Review",
              description: "Review structure and coding practices",
              icon: ShieldCheck,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              title: "Bug Detection",
              description: "Find likely issues and edge cases",
              icon: Bug,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              title: "Code Explanation",
              description: "Understand source code more easily",
              icon: BookOpen,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
            {
              title: "Test Suggestions",
              description: "Generate useful test-case ideas",
              icon: FlaskConical,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
          ].map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg}`}
                >
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-5 text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Upload and configuration */}
        {!result && (
          <form
            onSubmit={handleAnalyze}
            className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]"
          >
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Upload className="h-5 w-5 text-blue-400" />
                  Upload Your Repository
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Select a ZIP archive containing your project source
                  code. The backend will extract and analyze supported
                  source files.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
                  dragging
                    ? "border-blue-400 bg-blue-500/10"
                    : file
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-slate-700 bg-slate-950/40 hover:border-blue-500/60 hover:bg-blue-500/5"
                }`}
              >
                <div
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
                    file
                      ? "bg-emerald-500/10"
                      : "bg-blue-500/10"
                  }`}
                >
                  {file ? (
                    <FileArchive className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <Upload className="h-8 w-8 text-blue-400" />
                  )}
                </div>

                {file ? (
                  <>
                    <p className="max-w-full break-all font-semibold text-white">
                      {file.name}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      ZIP file ready for analysis
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-white">
                      Drop your repository ZIP here
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      or click to browse your files
                    </p>
                    <span className="mt-5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300">
                      Choose ZIP File
                    </span>
                  </>
                )}

                <p className="mt-4 text-xs text-slate-500">
                  ZIP archive · Maximum 5 MB
                </p>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileArchive className="h-5 w-5 shrink-0 text-blue-400" />
                    <span className="truncate text-sm text-slate-300">
                      {file.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFile(null);
                      setError("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
                    aria-label="Remove ZIP file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Analysis Configuration
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Choose what you want CodePilot AI to focus on.
                </p>
              </div>

              <div className="space-y-3">
                {ANALYSIS_TYPES.map((type) => {
                  const Icon = type.icon;
                  const selected = analysisType === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setAnalysisType(type.value)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-blue-500/60 bg-blue-500/10"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-100">
                            {type.label}
                          </p>
                          <span
                            className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                              selected
                                ? "border-blue-400 bg-blue-400 ring-2 ring-blue-400/20"
                                : "border-slate-600"
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {type.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="break-words leading-6">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Analyzing Repository...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Analyze Repository
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Analysis time depends on the number and size of supported
                source files in your archive.
              </p>
            </section>
          </form>
        )}

        {/* Loading state */}
        {loading && (
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-blue-400" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              Analyzing your repository
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your ZIP archive is being processed. Please keep this page
              open while the analysis runs.
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <section className="space-y-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Repository Results
                </h2>
                <p className="mt-2 break-words text-sm text-slate-400">
                  {result.repositoryName || file?.name || "Uploaded repository"}
                  {" · "}
                  {analysisType.replaceAll("_", " ")}
                </p>
              </div>

              <button
                type="button"
                onClick={resetAnalysis}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <RotateCcw className="h-4 w-4" />
                Analyze Another Repository
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Files Analyzed",
                  value: result.filesAnalyzed ?? successCount,
                  icon: FileCode2,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Successful",
                  value: successCount,
                  icon: CheckCircle2,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Failed",
                  value: result.filesFailed ?? failedCount,
                  icon: AlertCircle,
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                },
                {
                  label: "Analysis Mode",
                  value:
                    ANALYSIS_TYPES.find(
                      (item) => item.value === result.analysisType
                    )?.label ||
                    ANALYSIS_TYPES.find(
                      (item) => item.value === analysisType
                    )?.label ||
                    analysisType,
                  icon: Sparkles,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="mt-4 break-words text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {analyzedFiles.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  File-by-File Analysis
                </h3>
                {analyzedFiles.map((item, index) => (
                  <ResultCard
                    key={`${item.fileName || "file"}-${index}`}
                    file={item}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <FileCode2 className="mx-auto h-10 w-10 text-slate-500" />
                <h3 className="mt-4 font-semibold text-white">
                  No file results returned
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  The API returned a response, but no file results were
                  included. Check the backend response and supported file
                  extensions.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
