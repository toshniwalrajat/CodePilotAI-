
import { useRef, useState } from "react";
import {
  Upload,
  FileCode2,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import fileAnalysisService from "../services/fileAnalysisService";

const ANALYSIS_TYPES = [
  { value: "EXPLAIN", label: "Explain Code" },
  { value: "FIND_BUGS", label: "Find Bugs" },
  { value: "REVIEW", label: "Review Code" },
  { value: "GENERATE_TESTS", label: "Generate Tests" },
];

const SUPPORTED_EXTENSIONS = [
  "java", "py", "js", "jsx", "ts", "tsx", "c", "h",
  "cpp", "hpp", "cs", "go", "rs", "php", "rb",
  "kt", "swift", "sql",
];

const MAX_FILE_SIZE = 1024 * 1024;

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;

  if (!error?.response) {
    return "Could not connect to the backend. Check that Spring Boot is running on port 8080.";
  }

  return `File analysis failed (${error.response.status}). Please try again.`;
}

export default function FileAnalysis() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [analysisType, setAnalysisType] = useState("FIND_BUGS");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function validateFile(selectedFile) {
    if (!selectedFile) return "Please select a file.";

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (
      !selectedFile.name.includes(".") ||
      !SUPPORTED_EXTENSIONS.includes(extension)
    ) {
      return `Unsupported file type. Supported extensions: ${SUPPORTED_EXTENSIONS.join(", ")}`;
    }

    if (selectedFile.size === 0) {
      return "The selected file is empty.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size must not exceed 1 MB.";
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

  async function handleAnalyze() {
    if (!file || loading) return;

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await fileAnalysisService.analyzeFile(
        file,
        analysisType
      );

      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const findings = result?.findings ?? [];
  const generatedTests = result?.generatedTests ?? [];
  const explanation = result?.explanation;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10 text-slate-100">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
          <FileCode2 size={14} />
          AI File Intelligence
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          File Analysis
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Upload a source-code file to explain its logic, identify bugs,
          review code quality, or generate test cases using your local AI.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Upload Source File</h2>
            <p className="mt-1 text-xs text-slate-400">
              Maximum file size: 1 MB
            </p>
          </div>

          {file && (
            <button
              onClick={reset}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-50"
            >
              <X size={15} />
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
          className="hidden"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />

        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files?.[0]);
          }}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
            dragging
              ? "border-blue-400 bg-blue-500/10"
              : "border-slate-700 bg-slate-950/40 hover:border-slate-500"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Upload size={26} />
          </div>

          <h3 className="mt-4 font-semibold">
            Drag and drop your source file here
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            or browse files from your computer
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            Choose File
          </button>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Supported: Java, Python, JavaScript, TypeScript, C/C++,
            C#, Go, Rust, PHP, Ruby, Kotlin, Swift and SQL.
          </p>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <FileCode2 size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>

            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          </div>
        )}

        <div className="mt-6">
          <label
            htmlFor="file-analysis-type"
            className="mb-2 block text-sm font-medium"
          >
            Choose Analysis Type
          </label>

          <select
            id="file-analysis-type"
            value={analysisType}
            disabled={loading}
            onChange={(event) => {
              setAnalysisType(event.target.value);
              setResult(null);
              setError("");
            }}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 sm:max-w-md"
          >
            {ANALYSIS_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
          <p className="text-xs text-slate-500">
            Review AI-generated results before using suggested changes.
          </p>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Analyzing File...
              </>
            ) : (
              <>
                <FileCode2 size={17} />
                Analyze File
              </>
            )}
          </button>
        </div>
      </section>

      {loading && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
          <LoaderCircle
            size={32}
            className="mx-auto animate-spin text-blue-400"
          />
          <h2 className="mt-4 font-semibold">Analyzing your file</h2>
          <p className="mt-2 text-sm text-slate-400">
            Your local AI model is processing the uploaded source code.
            This may take a little time.
          </p>
        </section>
      )}

      {result && !loading && (
        <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={20} />
                <h2 className="font-semibold text-slate-100">
                  Analysis Complete
                </h2>
              </div>
              <p className="mt-1 pl-7 text-xs text-slate-400">
                {result.analysisType ?? analysisType}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(
                  JSON.stringify(result, null, 2)
                )
              }
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            >
              Copy JSON
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-blue-300">Summary</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {result.summary || "No summary provided."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-amber-300">
              Findings ({findings.length})
            </h3>

            {findings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">
                No findings were returned by the AI.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {findings.map((finding, index) => (
                  <article
                    key={`${finding.lineNumber ?? "na"}-${index}`}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300">
                        {finding.severity || "INFO"}
                      </span>
                      {finding.lineNumber != null && (
                        <span className="text-xs text-slate-500">
                          Line {finding.lineNumber}
                        </span>
                      )}
                    </div>

                    <h4 className="mt-3 text-sm font-semibold">
                      {finding.issue || "Finding"}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {finding.explanation}
                    </p>

                    {finding.recommendation && (
                      <div className="mt-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
                        <p className="text-xs font-semibold text-emerald-300">
                          Recommendation
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {finding.recommendation}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-emerald-300">
              Suggested Fix
            </h3>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              {result.suggestedFix || "No suggested fix provided."}
            </pre>
          </div>

          {generatedTests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-purple-300">
                Generated Tests ({generatedTests.length})
              </h3>
              <div className="mt-3 space-y-3">
                {generatedTests.map((test, index) => (
                  <pre
                    key={index}
                    className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300"
                  >
                    {test}
                  </pre>
                ))}
              </div>
            </div>
          )}

          {explanation?.lineByLine?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-blue-300">
                Line-by-Line Explanation
              </h3>
              <div className="mt-3 space-y-3">
                {explanation.lineByLine.map((line, index) => (
                  <article
                    key={`${line.lineNumber ?? "na"}-${index}`}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-xs text-blue-300">
                      Line {line.lineNumber ?? "—"}
                    </p>
                    <pre className="mt-2 overflow-x-auto text-sm text-slate-200">
                      {line.code}
                    </pre>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {line.explanation}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {explanation && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Time Complexity", explanation.timeComplexity],
                ["Space Complexity", explanation.spaceComplexity],
                ["Return Value", explanation.returnValue],
                ["Example Explanation", explanation.exampleExplanation],
              ]
                .filter(([, value]) => value != null && value !== "")
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <h4 className="text-xs font-semibold text-blue-300">
                      {label}
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {typeof value === "string"
                        ? value
                        : JSON.stringify(value, null, 2)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
