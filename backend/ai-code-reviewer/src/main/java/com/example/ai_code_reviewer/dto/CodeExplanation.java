package com.example.ai_code_reviewer.dto;

import java.util.List;

public record CodeExplanation( List<LineExplanation> lineByLine,
                               List<String> parameters,
                               String returnValue,
                               List<String> executionFlow,
                               String exampleInput,
                               String exampleOutput,
                               String exampleExplanation,
                               String timeComplexity,
                               String spaceComplexity,
                               List<String> notes
) {
}