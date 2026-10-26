
import { useState } from "react";
import {
  AlertCircle,
  Bug,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileCode2,
  LoaderCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TestTube2,
} from "lucide-react";

import codeAnalysisService from "../services/codeAnalysisService";

const MAX_CODE_LENGTH = 100000;

const ANALYSIS_TYPES = [
  {
    value: "EXPLAIN",
    label: "Explain Code",
    description: "Understand code line by line, including complexity.",
    icon: Sparkles,
  },
  {
    value: "FIND_BUGS",
    label: "Find Bugs",
    description: "Identify potential bugs and edge cases.",
    icon: Bug,
  },
  {
    value: "REVIEW",
    label: "Review Code",
    description: "Review code quality and security practices.",
    icon: ShieldCheck,
  },
  {
    value: "GENERATE_TESTS",
    label: "Generate Tests",
    description: "Generate useful test cases for your code.",
    icon: TestTube2,
  },
];

const LANGUAGES = [
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
];

const SAMPLE_CODE = {
  java: `public class Calculator {

    public int divide(int a, int b) {
        return a / b;
    }

    public static void main(String[] args) {
        Calculator calculator = new Calculator();
        System.out.println(calculator.divide(10, 0));
    }
}`,
  javascript: `function divide(a, b) {
    return a / b;
}

console.log(divide(10, 0));`,
  python: `def divide(a, b):
    return a / b

print(divide(10, 0))`,
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.error) {
    return data.error;
  }

  if (error?.code === "ECONNABORTED") {
    return "The analysis timed out. Try a smaller code sample or try again.";
  }

  if (!error?.response) {
    return "Cannot connect to Spring Boot. Check that the backend is running on http://localhost:8080 and that CORS is configured correctly.";
  }

  if (error.response.status === 400) {
    return "The backend rejected the request. Verify the AnalysisType enum and request fields.";
  }

  if (error.response.status === 404) {
    return "Analysis endpoint not found. Verify POST /api/analysis/explain.";
  }

  if (error.response.status >= 500) {
    return "The backend encountered an error. Check the Spring Boot console and AI model server.";
  }

  return `Analysis failed with HTTP status ${error.response.status}.`;
}

function formatValue(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function Section({ title, children, color = "text-blue-300" }) {
  return (
    <section className="min-w-0">
      <h3 className={`mb-3 text-sm font-semibold ${color}`}>{title}</h3>
      {children}
    </section>
  );
}

function EmptyValue({ children = "No information provided." }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function CodeBlockResult({ children }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-300">
      {children}
    </pre>
  );
}

function AnalysisResults({ result, analysisType }) {
  const [copied, setCopied] = useState(false);

  const findings = Array.isArray(result.findings)
    ? result.findings
    : [];

  const generatedTests = Array.isArray(result.generatedTests)
    ? result.generatedTests
    : [];

  const explanation = result.explanation;
  const lineByLine = Array.isArray(explanation?.lineByLine)
    ? explanation.lineByLine
    : [];

  const parameters = Array.isArray(explanation?.parameters)
    ? explanation.parameters
    : [];

  const notes = Array.isArray(explanation?.notes)
    ? explanation.notes
    : [];

  const report = formatValue(result);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Report header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2">
            <Check size={20} className="text-emerald-400" />
          </div>

          <div>
            <h3 className="font-semibold text-white">Analysis Complete</h3>
            <p className="mt-1 text-xs text-slate-400">
              {result.analysisType || analysisType}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>

      {/* Summary */}
      <Section title="Summary">
        {result.summary ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
            {result.summary}
          </p>
        ) : (
          <EmptyValue />
        )}
      </Section>

      {/* Findings */}
      <Section title={`Findings (${findings.length})`} color="text-amber-300">
        {findings.length > 0 ? (
          <div className="space-y-3">
            {findings.map((finding, index) => (
              <article
                key={`${finding.lineNumber ?? "unknown"}-${index}`}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-semibold uppercase text-amber-300">
                    {finding.severity || "INFO"}
                  </span>

                  {finding.lineNumber != null && (
                    <span className="text-xs text-slate-500">
                      Line {finding.lineNumber}
                    </span>
                  )}
                </div>

                <h4 className="mt-3 font-semibold text-white">
                  {finding.issue || "Potential issue"}
                </h4>

                {finding.explanation && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {finding.explanation}
                  </p>
                )}

                {finding.recommendation && (
                  <div className="mt-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
                    <p className="text-xs font-semibold text-emerald-300">
                      Recommendation
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {finding.recommendation}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyValue>
            No findings were returned by the backend.
          </EmptyValue>
        )}
      </Section>

      {/* Suggested fix */}
      <Section title="Suggested Fix" color="text-emerald-300">
        {result.suggestedFix ? (
          <CodeBlockResult>{result.suggestedFix}</CodeBlockResult>
        ) : (
          <EmptyValue />
        )}
      </Section>

      {/* Generated tests */}
      <Section
        title={`Generated Tests (${generatedTests.length})`}
        color="text-violet-300"
      >
        {generatedTests.length > 0 ? (
          <div className="space-y-3">
            {generatedTests.map((test, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <p className="mb-2 text-xs text-slate-500">
                  Test case {index + 1}
                </p>
                <CodeBlockResult>{test}</CodeBlockResult>
              </div>
            ))}
          </div>
        ) : (
          <EmptyValue />
        )}
      </Section>

      {/* Line-by-line explanation */}
      <Section
        title={`Line-by-Line Explanation (${lineByLine.length} lines)`}
      >
        {lineByLine.length > 0 ? (
          <div className="space-y-3">
            {lineByLine.map((line, index) => (
              <article
                key={`${line.lineNumber ?? "unknown"}-${index}`}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <p className="mb-2 text-xs font-medium text-slate-500">
                  Line {line.lineNumber ?? "—"}
                </p>

                {line.code && (
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-blue-200">
                    {line.code}
                  </pre>
                )}

                {line.explanation && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {line.explanation}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyValue />
        )}
      </Section>

      {/* Additional explanation details */}
      {explanation && (
        <Section title="Execution Details">
          <div className="space-y-4">
            {parameters.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Parameters
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {parameters.map((parameter, index) => (
                    <li key={index}>{parameter}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.returnValue && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Return Value
                </h4>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {explanation.returnValue}
                </p>
              </div>
            )}

            {explanation.executionFlow != null && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Execution Flow
                </h4>
                <CodeBlockResult>
                  {formatValue(explanation.executionFlow)}
                </CodeBlockResult>
              </div>
            )}

            {(explanation.exampleInput != null ||
              explanation.exampleOutput != null) && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <h4 className="text-xs font-semibold text-slate-400">
                    Example Input
                  </h4>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-300">
                    {explanation.exampleInput != null
                      ? formatValue(explanation.exampleInput)
                      : "Not provided"}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <h4 className="text-xs font-semibold text-slate-400">
                    Example Output
                  </h4>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-300">
                    {explanation.exampleOutput != null
                      ? formatValue(explanation.exampleOutput)
                      : "Not provided"}
                  </pre>
                </div>
              </div>
            )}

            {explanation.exampleExplanation && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Example Explanation
                </h4>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {explanation.exampleExplanation}
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <h4 className="text-xs text-slate-500">Time Complexity</h4>
                <p className="mt-2 font-mono text-sm text-blue-300">
                  {explanation.timeComplexity || "Not provided"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <h4 className="text-xs text-slate-500">Space Complexity</h4>
                <p className="mt-2 font-mono text-sm text-blue-300">
                  {explanation.spaceComplexity || "Not provided"}
                </p>
              </div>
            </div>

            {notes.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                  {notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

export default function CodeAnalysis() {
  const [language, setLanguage] = useState("java");
  const [analysisType, setAnalysisType] = useState("FIND_BUGS");
  const [code, setCode] = useState(SAMPLE_CODE.java);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedType = ANALYSIS_TYPES.find(
    (type) => type.value === analysisType
  );

  function handleLanguageChange(event) {
    const nextLanguage = event.target.value;

    setLanguage(nextLanguage);
    setCode(SAMPLE_CODE[nextLanguage] || "");
    setResult(null);
    setErrorMessage("");
  }

  function resetEditor() {
    setCode(SAMPLE_CODE[language] || "");
    setResult(null);
    setErrorMessage("");
  }

  function handleCodeChange(event) {
    setCode(event.target.value);
    setResult(null);
    setErrorMessage("");
  }

  async function handleAnalyze() {
    if (!code.trim()) {
      setErrorMessage("Please enter source code before starting the analysis.");
      setResult(null);
      return;
    }

    if (code.length > MAX_CODE_LENGTH) {
      setErrorMessage(
        `Code must not exceed ${MAX_CODE_LENGTH.toLocaleString()} characters.`
      );
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setResult(null);

    try {
      const response = await codeAnalysisService.analyzeCode({
        language,
        analysisType,
        code,
      });

      if (!response || typeof response !== "object") {
        throw new Error("The backend returned an invalid response.");
      }

      setResult(response);
    } catch (error) {
      setErrorMessage(
        error.message === "The backend returned an invalid response."
          ? error.message
          : getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
            <Sparkles size={14} />
            AI Code Intelligence
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Code Analysis
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Understand your code, identify potential bugs, improve quality,
            and generate test cases with your AI coding assistant.
          </p>
        </div>
      </section>

      {/* Analysis mode selection */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Choose Analysis Type
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select what you want the AI to do with your code.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ANALYSIS_TYPES.map((type) => {
            const Icon = type.icon;
            const active = analysisType === type.value;

            return (
              <button
                type="button"
                key={type.value}
                aria-pressed={active}
                onClick={() => {
                  setAnalysisType(type.value);
                  setResult(null);
                  setErrorMessage("");
                }}
                disabled={loading}
                className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "border-blue-500/60 bg-blue-500/10"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`rounded-xl p-2.5 ${
                      active ? "bg-blue-500/15" : "bg-slate-800"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={
                        active ? "text-blue-400" : "text-slate-400"
                      }
                    />
                  </div>

                  {active && (
                    <Check size={17} className="text-blue-400" />
                  )}
                </div>

                <h3 className="mt-4 text-sm font-semibold text-white">
                  {type.label}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Editor and results */}
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        {/* Editor */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2.5">
                <Code2 size={20} className="text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">Source Code</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter or paste your source code
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetEditor}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-950/50 px-4 py-3 sm:px-5">
            <label className="flex items-center gap-2 text-xs text-slate-400">
              Language

              <span className="relative">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  disabled={loading}
                  className="appearance-none rounded-lg border border-slate-700 bg-slate-900 py-2 pl-3 pr-8 text-sm text-slate-200 outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  {LANGUAGES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </span>
            </label>

            <span className="ml-auto inline-flex items-center gap-2 text-xs text-slate-500">
              <FileCode2 size={15} />
              {code.split("\n").length} lines
            </span>
          </div>

          <textarea
            value={code}
            onChange={handleCodeChange}
            disabled={loading}
            spellCheck={false}
            aria-label="Source code editor"
            placeholder="Paste your source code here..."
            className="min-h-[380px] w-full resize-y bg-slate-950 px-4 py-5 font-mono text-sm leading-7 text-slate-200 outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-inset focus:ring-blue-500/40 disabled:opacity-70 sm:px-5"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-4 sm:px-5">
            <div>
              <p
                className={`text-xs ${
                  code.length > MAX_CODE_LENGTH
                    ? "text-red-400"
                    : "text-slate-500"
                }`}
              >
                {code.length.toLocaleString()} /{" "}
                {MAX_CODE_LENGTH.toLocaleString()} characters
              </p>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                loading ||
                !code.trim() ||
                code.length > MAX_CODE_LENGTH
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Analyze Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
              <div className="rounded-xl bg-violet-500/10 p-2.5">
                <Sparkles size={20} className="text-violet-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Analysis Results
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedType?.label || "AI report"}
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5">
              {loading ? (
                <div
                  role="status"
                  className="flex min-h-[300px] flex-col items-center justify-center text-center"
                >
                  <LoaderCircle
                    size={34}
                    className="animate-spin text-blue-400"
                  />

                  <h3 className="mt-5 font-semibold text-white">
                    Analyzing your code
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                    The AI is reviewing your submission. This may take a
                    little time.
                  </p>
                </div>
              ) : errorMessage ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-300">
                    <AlertCircle size={18} />
                    Analysis failed
                  </div>

                  <p className="mt-3 break-words text-sm leading-6 text-slate-400">
                    {errorMessage}
                  </p>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading || !code.trim()}
                    className="mt-4 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Try Again
                  </button>
                </div>
              ) : result ? (
                <AnalysisResults
                  result={result}
                  analysisType={analysisType}
                />
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <Code2 size={30} className="text-slate-500" />
                  </div>

                  <h3 className="mt-5 font-semibold text-white">
                    Ready to analyze
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Choose an analysis type, enter your code, and click
                    Analyze Code to see your report here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Review responsibly
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  AI findings are suggestions, not guarantees. Verify
                  proposed fixes and run tests before using them in production.
                  Never execute untrusted generated code automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
