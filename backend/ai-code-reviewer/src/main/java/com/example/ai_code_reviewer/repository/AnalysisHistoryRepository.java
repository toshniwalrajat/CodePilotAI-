package com.example.ai_code_reviewer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalysisHistoryRepository
        extends JpaRepository<com.example.ai_code_reviewer.entity.AnalysisHistory, Long> {
}