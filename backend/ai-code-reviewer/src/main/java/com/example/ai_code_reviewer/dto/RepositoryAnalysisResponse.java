
package com.example.ai_code_reviewer.dto;

import com.example.ai_code_reviewer.enums.AnalysisType;

import java.time.LocalDateTime;
import java.util.List;

public record RepositoryAnalysisResponse(
        Long id,
        String repositoryName,
        AnalysisType analysisType,
        int filesAnalyzed,
        int filesFailed,
        List<FileResult> files,
        LocalDateTime createdAt
) {
    public record FileResult(
            String fileName,
            CodeAnalysisResponse analysis,
            String error
    ) {
    }
}
