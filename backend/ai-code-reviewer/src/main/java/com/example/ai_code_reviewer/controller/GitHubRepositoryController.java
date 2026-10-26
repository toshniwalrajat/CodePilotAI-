
package com.example.ai_code_reviewer.controller;

import com.example.ai_code_reviewer.dto.GitHubRepositoryRequest;
import com.example.ai_code_reviewer.dto.RepositoryAnalysisResponse;
import com.example.ai_code_reviewer.service.GitHubRepositoryService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis/github")
public class GitHubRepositoryController {

    private final GitHubRepositoryService githubRepositoryService;

    public GitHubRepositoryController(
            GitHubRepositoryService githubRepositoryService) {
        this.githubRepositoryService = githubRepositoryService;
    }

    @PostMapping
    public RepositoryAnalysisResponse analyzeGitHubRepository(
            @Valid @RequestBody GitHubRepositoryRequest request) {

        return githubRepositoryService.analyzeRepository(
                request.repositoryUrl(),
                request.analysisType()
        );
    }
}
