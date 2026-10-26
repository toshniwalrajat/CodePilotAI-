
package com.example.ai_code_reviewer.dto;

import com.example.ai_code_reviewer.enums.AnalysisType;
import java.util.List;

public record CodeAnalysisResponse(
        AnalysisType analysisType,
        String summary,
        List<Finding> findings,
        String suggestedFix,
        List<String> generatedTests,
        Explanation explanation
) {
    public record Finding(
            String severity,
            Integer lineNumber,
            String issue,
            String explanation,
            String recommendation
    ) {}

    public record LineExplanation(
            Integer lineNumber,
            String code,
            String explanation
    ) {}

    public record Explanation(
            List<LineExplanation> lineByLine,
            List<String> parameters,
            String returnValue,
            Object executionFlow,
            Object exampleInput,
            Object exampleOutput,
            String exampleExplanation,
            String timeComplexity,
            String spaceComplexity,
            List<String> notes
    ) {}
}
