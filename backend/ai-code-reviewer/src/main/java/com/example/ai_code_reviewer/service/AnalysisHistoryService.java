
package com.example.ai_code_reviewer.service;

import com.example.ai_code_reviewer.dto.AnalysisHistoryResponse;
import com.example.ai_code_reviewer.entity.AnalysisHistory;
import com.example.ai_code_reviewer.repository.AnalysisHistoryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AnalysisHistoryService {

    private final AnalysisHistoryRepository analysisHistoryRepository;

    public AnalysisHistoryService(
            AnalysisHistoryRepository analysisHistoryRepository) {
        this.analysisHistoryRepository = analysisHistoryRepository;
    }

    // Get all history records
    public List<AnalysisHistoryResponse> getAllHistory() {
        return analysisHistoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get one history record by ID
    public AnalysisHistoryResponse getHistoryById(Long id) {
        AnalysisHistory history = findHistoryById(id);
        return toResponse(history);
    }

    // Delete one history record by ID
    public void deleteHistoryById(Long id) {
        AnalysisHistory history = findHistoryById(id);
        analysisHistoryRepository.delete(history);
    }

    // Find a record or return 404
    private AnalysisHistory findHistoryById(Long id) {
        return analysisHistoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Analysis history not found with ID: " + id
                ));
    }

    // Convert entity to response DTO
    private AnalysisHistoryResponse toResponse(AnalysisHistory history) {
        return new AnalysisHistoryResponse(
                history.getId(),
                history.getLanguage(),
                history.getAnalysisType().name(),
                history.getSourceCode(),
                history.getResultJson(),
                history.getCreatedAt()
        );
    }
}
