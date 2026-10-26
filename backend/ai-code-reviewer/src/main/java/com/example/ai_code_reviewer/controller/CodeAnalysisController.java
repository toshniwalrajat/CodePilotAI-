package com.example.ai_code_reviewer.controller;

import com.example.ai_code_reviewer.dto.CodeAnalysisRequest;
import com.example.ai_code_reviewer.dto.CodeAnalysisResponse;
import com.example.ai_code_reviewer.service.CodeAnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
public class CodeAnalysisController {

    private final CodeAnalysisService codeAnalysisService;

    public CodeAnalysisController(
            CodeAnalysisService codeAnalysisService) {
        this.codeAnalysisService = codeAnalysisService;
    }

    @PostMapping("/explain")
    public ResponseEntity<CodeAnalysisResponse> analyzeCode(
            @Valid @RequestBody CodeAnalysisRequest request) {

        CodeAnalysisResponse response =
                codeAnalysisService.analyze(request);

        return ResponseEntity.ok(response);
    }
}