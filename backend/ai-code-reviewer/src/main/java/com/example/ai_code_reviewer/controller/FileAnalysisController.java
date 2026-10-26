
package com.example.ai_code_reviewer.controller;

import com.example.ai_code_reviewer.dto.CodeAnalysisRequest;
import com.example.ai_code_reviewer.dto.CodeAnalysisResponse;
import com.example.ai_code_reviewer.enums.AnalysisType;
import com.example.ai_code_reviewer.service.CodeAnalysisService;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analysis")
public class FileAnalysisController {

    private static final long MAX_FILE_SIZE = 1024L * 1024L;
    private static final int MAX_CODE_LENGTH = 100_000;

    private static final Map<String, String> SUPPORTED_EXTENSIONS =
            Map.ofEntries(
                    Map.entry("java", "java"),
                    Map.entry("py", "python"),
                    Map.entry("js", "javascript"),
                    Map.entry("jsx", "javascript"),
                    Map.entry("ts", "typescript"),
                    Map.entry("tsx", "typescript"),
                    Map.entry("c", "c"),
                    Map.entry("h", "c"),
                    Map.entry("cpp", "cpp"),
                    Map.entry("hpp", "cpp"),
                    Map.entry("cs", "csharp"),
                    Map.entry("go", "go"),
                    Map.entry("rs", "rust"),
                    Map.entry("php", "php"),
                    Map.entry("rb", "ruby"),
                    Map.entry("kt", "kotlin"),
                    Map.entry("swift", "swift"),
                    Map.entry("sql", "sql")
            );

    private final CodeAnalysisService codeAnalysisService;

    public FileAnalysisController(
            CodeAnalysisService codeAnalysisService) {
        this.codeAnalysisService = codeAnalysisService;
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public CodeAnalysisResponse analyzeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("analysisType") AnalysisType analysisType) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please upload a non-empty source-code file."
            );
        }

        if (analysisType == null) {
            throw new IllegalArgumentException(
                    "Please select an analysis type."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size must not exceed 1 MB."
            );
        }

        String filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException(
                    "The uploaded file must have a filename."
            );
        }

        // Normalize Windows and Unix path separators before extracting
        // the filename. Only the extension is used for language detection.
        String normalizedFilename = filename.replace('\\', '/');
        int slashIndex = normalizedFilename.lastIndexOf('/');
        String safeFilename =
                normalizedFilename.substring(slashIndex + 1);

        int dotIndex = safeFilename.lastIndexOf('.');

        if (dotIndex <= 0 || dotIndex == safeFilename.length() - 1) {
            throw new IllegalArgumentException(
                    "The uploaded file must have a supported extension."
            );
        }

        String extension = safeFilename.substring(dotIndex + 1)
                .toLowerCase(Locale.ROOT);

        String language = SUPPORTED_EXTENSIONS.get(extension);

        if (language == null) {
            String supported = SUPPORTED_EXTENSIONS.keySet().stream()
                    .sorted()
                    .collect(Collectors.joining(", "));

            throw new IllegalArgumentException(
                    "Unsupported file type. Supported extensions: "
                            + supported
            );
        }

        try {
            byte[] bytes = file.getBytes();

            // Reject malformed UTF-8 rather than silently replacing
            // invalid bytes with replacement characters.
            String sourceCode = StandardCharsets.UTF_8
                    .newDecoder()
                    .decode(java.nio.ByteBuffer.wrap(bytes))
                    .toString();

            if (sourceCode.isBlank()) {
                throw new IllegalArgumentException(
                        "The uploaded file contains no source code."
                );
            }

            if (sourceCode.length() > MAX_CODE_LENGTH) {
                throw new IllegalArgumentException(
                        "Source code must not exceed "
                                + MAX_CODE_LENGTH + " characters."
                );
            }

            CodeAnalysisRequest request = new CodeAnalysisRequest(
                    language,
                    analysisType,
                    sourceCode
            );

            // Reuse AI analysis and existing history persistence.
            return codeAnalysisService.analyze(request);

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to read the uploaded source-code file.",
                    exception
            );
        }
    }
}
