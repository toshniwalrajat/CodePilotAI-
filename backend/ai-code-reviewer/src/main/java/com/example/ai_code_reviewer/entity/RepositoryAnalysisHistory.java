
package com.example.ai_code_reviewer.entity;

import com.example.ai_code_reviewer.enums.AnalysisType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "repository_analysis_history")
public class RepositoryAnalysisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String repositoryName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AnalysisType analysisType;

    @Column(nullable = false)
    private int filesAnalyzed;

    @Column(nullable = false)
    private int filesFailed;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String resultJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public RepositoryAnalysisHistory() {
    }

    public RepositoryAnalysisHistory(
            String repositoryName,
            AnalysisType analysisType,
            int filesAnalyzed,
            int filesFailed,
            String resultJson
    ) {
        this.repositoryName = repositoryName;
        this.analysisType = analysisType;
        this.filesAnalyzed = filesAnalyzed;
        this.filesFailed = filesFailed;
        this.resultJson = resultJson;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getRepositoryName() {
        return repositoryName;
    }

    public AnalysisType getAnalysisType() {
        return analysisType;
    }

    public int getFilesAnalyzed() {
        return filesAnalyzed;
    }

    public int getFilesFailed() {
        return filesFailed;
    }

    public String getResultJson() {
        return resultJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
