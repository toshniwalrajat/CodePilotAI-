package com.example.ai_code_reviewer.dto;

import java.time.LocalDateTime;

public record AnalysisHistoryResponse(
        Long id,
        String language,
        String analysisType,
        String sourceCode,
        String resultJson,
        LocalDateTime createdAt
) {
}