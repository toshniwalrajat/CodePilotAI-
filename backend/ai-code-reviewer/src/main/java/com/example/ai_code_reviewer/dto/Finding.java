package com.example.ai_code_reviewer.dto;

import com.example.ai_code_reviewer.enums.Severity;

public record Finding(
        Severity severity,
        Integer lineNumber,
        String issue,
        String explanation,
        String recommendation
){
}