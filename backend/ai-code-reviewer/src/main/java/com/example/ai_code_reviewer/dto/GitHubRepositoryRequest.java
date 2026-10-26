
package com.example.ai_code_reviewer.dto;

import com.example.ai_code_reviewer.enums.AnalysisType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record GitHubRepositoryRequest(

        @NotBlank(message = "GitHub repository URL is required")
        @Pattern(
                regexp = "^https://github\\.com/[^/\\s]+/[^/\\s]+/?$",
                message = "Enter a valid GitHub repository URL"
        )
        String repositoryUrl,

        @NotNull(message = "Analysis type is required")
        AnalysisType analysisType
) {
}
