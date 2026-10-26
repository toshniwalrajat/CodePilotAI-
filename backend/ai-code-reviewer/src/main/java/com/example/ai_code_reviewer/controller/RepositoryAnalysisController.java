
package com.example.ai_code_reviewer.controller;

import com.example.ai_code_reviewer.dto.RepositoryAnalysisResponse;
import com.example.ai_code_reviewer.enums.AnalysisType;
import com.example.ai_code_reviewer.service.RepositoryAnalysisService;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/analysis/repository")
public class RepositoryAnalysisController {

    private final RepositoryAnalysisService repositoryAnalysisService;

    public RepositoryAnalysisController(
            RepositoryAnalysisService repositoryAnalysisService) {
        this.repositoryAnalysisService = repositoryAnalysisService;
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public RepositoryAnalysisResponse analyzeRepository(
            @RequestParam("file") MultipartFile file,
            @RequestParam("analysisType") AnalysisType analysisType) {

        return repositoryAnalysisService.analyzeRepository(
                file,
                analysisType
        );
    }
}
