
package com.example.ai_code_reviewer.repository;

import com.example.ai_code_reviewer.entity.RepositoryAnalysisHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepositoryAnalysisHistoryRepository
        extends JpaRepository<RepositoryAnalysisHistory, Long> {
}
