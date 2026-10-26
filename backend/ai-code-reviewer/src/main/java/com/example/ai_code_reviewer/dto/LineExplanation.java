package com.example.ai_code_reviewer.dto;

public record LineExplanation
        ( int lineNumber,
          String code,
          String explanation){
}
