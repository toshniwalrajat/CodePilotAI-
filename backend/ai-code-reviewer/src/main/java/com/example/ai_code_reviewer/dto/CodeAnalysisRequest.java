package com.example.ai_code_reviewer.dto;

import com.example.ai_code_reviewer.enums.AnalysisType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CodeAnalysisRequest(

        @NotBlank(message = "Language is required")
        String language,

        @NotNull(message = "Analysis type is required")
        AnalysisType analysisType,

        @NotBlank(message = "Source code is required")
        @Size(max = 100000, message = "Code must not exceed 100000 characters")
        String code

) {
}