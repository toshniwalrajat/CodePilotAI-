
package com.example.ai_code_reviewer.entity;

import com.example.ai_code_reviewer.enums.AnalysisType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_history")
public class AnalysisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AnalysisType analysisType;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String sourceCode;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String resultJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public AnalysisHistory() {
    }

    public AnalysisHistory(
            String language,
            AnalysisType analysisType,
            String sourceCode,
            String resultJson
    ) {
        this.language = language;
        this.analysisType = analysisType;
        this.sourceCode = sourceCode;
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

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public AnalysisType getAnalysisType() {
        return analysisType;
    }

    public void setAnalysisType(AnalysisType analysisType) {
        this.analysisType = analysisType;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public String getResultJson() {
        return resultJson;
    }

    public void setResultJson(String resultJson) {
        this.resultJson = resultJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
