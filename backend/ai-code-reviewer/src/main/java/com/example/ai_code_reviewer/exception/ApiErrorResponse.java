package com.example.ai_code_reviewer.exception;

public record ApiErrorResponse(
        int status,
        String error,
        String message,
        String path
) {
}