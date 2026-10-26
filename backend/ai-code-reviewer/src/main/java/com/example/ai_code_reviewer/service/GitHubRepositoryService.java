
package com.example.ai_code_reviewer.service;

import com.example.ai_code_reviewer.dto.RepositoryAnalysisResponse;
import com.example.ai_code_reviewer.enums.AnalysisType;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GitHubRepositoryService {

    private static final int MAX_DOWNLOAD_SIZE = 5 * 1024 * 1024;
    private static final int MAX_REDIRECTS = 3;

    private static final Pattern REPOSITORY_PATTERN = Pattern.compile(
            "^https://github\\.com/([A-Za-z0-9-]+)/([A-Za-z0-9_.-]+)/?$",
            Pattern.CASE_INSENSITIVE
    );

    private final RepositoryAnalysisService repositoryAnalysisService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    public GitHubRepositoryService(
            RepositoryAnalysisService repositoryAnalysisService) {
        this.repositoryAnalysisService = repositoryAnalysisService;
    }

    public RepositoryAnalysisResponse analyzeRepository(
            String repositoryUrl,
            AnalysisType analysisType) {

        if (repositoryUrl == null || analysisType == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Repository URL and analysis type are required."
            );
        }

        Matcher matcher = REPOSITORY_PATTERN.matcher(repositoryUrl.trim());

        if (!matcher.matches()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Use a URL like https://github.com/owner/repository"
            );
        }

        String owner = matcher.group(1);
        String repository = matcher.group(2);

        if (repository.endsWith(".git")) {
            repository = repository.substring(0, repository.length() - 4);
        }

        if (owner.isBlank() || repository.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid GitHub repository URL."
            );
        }

        String zipUrl = "https://api.github.com/repos/"
                + owner + "/" + repository + "/zipball";

        try {
            byte[] zipBytes = downloadRepositoryZip(zipUrl);

            MultipartFile zipFile = new ByteArrayMultipartFile(
                    "file",
                    repository + ".zip",
                    "application/zip",
                    zipBytes
            );

            return repositoryAnalysisService.analyzeRepository(
                    zipFile,
                    analysisType
            );

        } catch (ResponseStatusException exception) {
            throw exception;

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to read the GitHub repository archive.",
                    exception
            );

        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "GitHub repository download was interrupted.",
                    exception
            );
        }
    }

    private byte[] downloadRepositoryZip(String initialUrl)
            throws IOException, InterruptedException {

        URI currentUri = URI.create(initialUrl);

        for (int redirectCount = 0;
             redirectCount <= MAX_REDIRECTS;
             redirectCount++) {

            // Only allow HTTPS downloads from GitHub's API or
            // GitHub's documented archive delivery host.
            String host = currentUri.getHost();

            if (!"api.github.com".equalsIgnoreCase(host)
                    && !"codeload.github.com".equalsIgnoreCase(host)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "GitHub returned an unsupported download destination."
                );
            }

            if (!"https".equalsIgnoreCase(currentUri.getScheme())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "GitHub download redirects must use HTTPS."
                );
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(currentUri)
                    .timeout(Duration.ofSeconds(60))
                    .header("Accept", "application/vnd.github+json")
                    .header("User-Agent", "CodePilot-AI")
                    .GET()
                    .build();

            HttpResponse<InputStream> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofInputStream()
            );

            int status = response.statusCode();

            if (status == 200) {
                try (InputStream input = response.body()) {
                    return readLimited(input);
                }
            }

            try (InputStream ignored = response.body()) {
                if (status == 301 || status == 302
                        || status == 303 || status == 307
                        || status == 308) {

                    String location = response.headers()
                            .firstValue("Location")
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.BAD_GATEWAY,
                                    "GitHub returned a redirect without a destination."
                            ));

                    if (redirectCount == MAX_REDIRECTS) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_GATEWAY,
                                "Too many redirects while downloading the repository."
                        );
                    }

                    URI nextUri = currentUri.resolve(location);

                    // Validate the destination on the next loop iteration.
                    currentUri = nextUri;
                    continue;
                }
            }

            if (status == 404) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Repository not found or it is not publicly accessible."
                );
            }

            if (status == 403) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "GitHub denied the download. Check rate limits or repository access."
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not download the GitHub repository. HTTP status: "
                            + status
            );
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Could not download the GitHub repository archive."
        );
    }

    private byte[] readLimited(InputStream input) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int total = 0;
        int read;

        while ((read = input.read(buffer)) != -1) {
            total += read;

            if (total > MAX_DOWNLOAD_SIZE) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Downloaded repository ZIP exceeds 5 MB."
                );
            }

            output.write(buffer, 0, read);
        }

        if (total == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GitHub returned an empty repository archive."
            );
        }

        return output.toByteArray();
    }
}
