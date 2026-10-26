
package com.example.ai_code_reviewer.controller;

import com.example.ai_code_reviewer.dto.AnalysisHistoryResponse;
import com.example.ai_code_reviewer.service.AnalysisHistoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis/history")
public class AnalysisHistoryController {

    private final AnalysisHistoryService analysisHistoryService;

    public AnalysisHistoryController(
            AnalysisHistoryService analysisHistoryService) {
        this.analysisHistoryService = analysisHistoryService;
    }

    @GetMapping
    public List<AnalysisHistoryResponse> getAllHistory() {
        return analysisHistoryService.getAllHistory();
    }

    // Get a single history record by ID
    @GetMapping("/{id}")
    public AnalysisHistoryResponse getHistoryById(
            @PathVariable Long id) {
        return analysisHistoryService.getHistoryById(id);
    }
    // Delete a history record by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistoryById(
            @PathVariable Long id) {
        analysisHistoryService.deleteHistoryById(id);
        return ResponseEntity.noContent().build();
    }
}


