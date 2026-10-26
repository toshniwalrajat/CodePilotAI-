
package com.example.ai_code_reviewer.service;

import com.example.ai_code_reviewer.dto.CodeAnalysisRequest;
import com.example.ai_code_reviewer.dto.CodeAnalysisResponse;
import com.example.ai_code_reviewer.dto.RepositoryAnalysisResponse;
import com.example.ai_code_reviewer.entity.RepositoryAnalysisHistory;
import com.example.ai_code_reviewer.enums.AnalysisType;
import com.example.ai_code_reviewer.repository.RepositoryAnalysisHistoryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class RepositoryAnalysisService {

    private static final long MAX_ZIP_SIZE = 5L * 1024 * 1024;
    private static final long MAX_TOTAL_UNCOMPRESSED =
            10L * 1024 * 1024;
    private static final int MAX_FILE_SIZE = 1024 * 1024;
    private static final int MAX_ENTRIES = 200;
    private static final int MAX_SOURCE_FILES = 50;

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
    private final RepositoryAnalysisHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public RepositoryAnalysisService(
            CodeAnalysisService codeAnalysisService,
            RepositoryAnalysisHistoryRepository historyRepository,
            ObjectMapper objectMapper) {
        this.codeAnalysisService = codeAnalysisService;
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
    }

    public RepositoryAnalysisResponse analyzeRepository(
            MultipartFile zipFile,
            AnalysisType analysisType) {

        if (zipFile == null || zipFile.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please upload a non-empty ZIP file."
            );
        }

        if (zipFile.getSize() > MAX_ZIP_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "ZIP file must not exceed 5 MB."
            );
        }

        if (analysisType == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Analysis type is required."
            );
        }

        String repositoryName = zipFile.getOriginalFilename();

        if (repositoryName == null || repositoryName.isBlank()) {
            repositoryName = "uploaded-repository.zip";
        }

        if (!repositoryName.toLowerCase(Locale.ROOT).endsWith(".zip")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only ZIP archives are supported."
            );
        }

        List<RepositoryAnalysisResponse.FileResult> results =
                new ArrayList<>();

        long totalUncompressedBytes = 0;
        int entriesProcessed = 0;
        int sourceFilesProcessed = 0;

        try (InputStream input = zipFile.getInputStream();
             ZipInputStream zip = new ZipInputStream(input)) {

            ZipEntry entry;

            while ((entry = zip.getNextEntry()) != null) {
                entriesProcessed++;

                if (entriesProcessed > MAX_ENTRIES) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "ZIP archive contains too many entries."
                    );
                }

                String entryName = entry.getName();

                if (isUnsafePath(entryName)) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "ZIP contains an unsafe file path."
                    );
                }

                if (entry.isDirectory()) {
                    zip.closeEntry();
                    continue;
                }

                String extension = getExtension(entryName);
                String language = SUPPORTED_EXTENSIONS.get(extension);

                if (language == null) {
                    // Drain unsupported entries too, so archive size
                    // limits apply to all uncompressed content.
                    long skipped = drainEntry(zip, MAX_FILE_SIZE);
                    totalUncompressedBytes += skipped;

                    if (totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Uncompressed ZIP content exceeds 10 MB."
                        );
                    }

                    zip.closeEntry();
                    continue;
                }

                sourceFilesProcessed++;

                if (sourceFilesProcessed > MAX_SOURCE_FILES) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "ZIP may contain at most 50 supported source files."
                    );
                }

                byte[] content = readEntry(zip, MAX_FILE_SIZE);
                totalUncompressedBytes += content.length;

                if (totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Uncompressed ZIP content exceeds 10 MB."
                    );
                }

                zip.closeEntry();

                String sourceCode = new String(
                        content,
                        StandardCharsets.UTF_8
                );

                if (sourceCode.isBlank()) {
                    results.add(
                            new RepositoryAnalysisResponse.FileResult(
                                    entryName,
                                    null,
                                    "Source file is empty."
                            )
                    );
                    continue;
                }

                try {
                    CodeAnalysisResponse analysis =
                            codeAnalysisService.analyze(
                                    new CodeAnalysisRequest(
                                            language,
                                            analysisType,
                                            sourceCode
                                    )
                            );

                    results.add(
                            new RepositoryAnalysisResponse.FileResult(
                                    entryName,
                                    analysis,
                                    null
                            )
                    );

                } catch (RuntimeException exception) {
                    results.add(
                            new RepositoryAnalysisResponse.FileResult(
                                    entryName,
                                    null,
                                    "Analysis failed for this file: "
                                            + safeMessage(exception)
                            )
                    );
                }
            }

        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to read ZIP archive. Check that it is a valid ZIP file.",
                    exception
            );
        }

        if (sourceFilesProcessed == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "ZIP archive contains no supported source files."
            );
        }

        int analyzed = (int) results.stream()
                .filter(result -> result.analysis() != null)
                .count();

        int failed = results.size() - analyzed;

        try {
            String resultJson = objectMapper.writeValueAsString(results);

            RepositoryAnalysisHistory history =
                    new RepositoryAnalysisHistory(
                            repositoryName,
                            analysisType,
                            analyzed,
                            failed,
                            resultJson
                    );

            RepositoryAnalysisHistory saved =
                    historyRepository.save(history);

            return new RepositoryAnalysisResponse(
                    saved.getId(),
                    saved.getRepositoryName(),
                    saved.getAnalysisType(),
                    saved.getFilesAnalyzed(),
                    saved.getFilesFailed(),
                    results,
                    saved.getCreatedAt()
            );

        } catch (JacksonException exception) {
            throw new IllegalStateException(
                    "Unable to serialize the repository analysis report.",
                    exception
            );
        }
    }

    private byte[] readEntry(
            InputStream input,
            int maxBytes) throws IOException {

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int total = 0;
        int read;

        while ((read = input.read(buffer)) != -1) {
            total += read;

            if (total > maxBytes) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A ZIP entry exceeds the 1 MB file limit."
                );
            }

            output.write(buffer, 0, read);
        }

        return output.toByteArray();
    }

    private long drainEntry(
            InputStream input,
            int maxBytes) throws IOException {

        long total = 0;
        byte[] buffer = new byte[8192];
        int read;

        while ((read = input.read(buffer)) != -1) {
            total += read;

            if (total > maxBytes) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A ZIP entry exceeds the 1 MB entry limit."
                );
            }
        }

        return total;
    }

    private boolean isUnsafePath(String name) {
        if (name == null || name.isBlank()
                || name.startsWith("/")
                || name.startsWith("\\")
                || name.contains("\\")) {
            return true;
        }

        String[] parts = name.split("/");

        for (String part : parts) {
            if ("..".equals(part)) {
                return true;
            }
        }

        return name.matches("^[A-Za-z]:.*");
    }

    private String getExtension(String name) {
        int slash = name.lastIndexOf('/');
        int dot = name.lastIndexOf('.');

        if (dot <= slash || dot == name.length() - 1) {
            return "";
        }

        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String safeMessage(RuntimeException exception) {
        String message = exception.getMessage();

        if (message == null || message.isBlank()) {
            return exception.getClass().getSimpleName();
        }

        return message.length() > 250
                ? message.substring(0, 250)
                : message;
    }
}
