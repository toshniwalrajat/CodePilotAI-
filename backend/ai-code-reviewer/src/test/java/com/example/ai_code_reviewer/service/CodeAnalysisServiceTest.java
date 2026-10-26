
package com.example.ai_code_reviewer.service;

import com.example.ai_code_reviewer.client.LMStudioClient;
import com.example.ai_code_reviewer.dto.CodeAnalysisRequest;
import com.example.ai_code_reviewer.dto.CodeAnalysisResponse;
import com.example.ai_code_reviewer.entity.AnalysisHistory;
import com.example.ai_code_reviewer.enums.AnalysisType;
import com.example.ai_code_reviewer.repository.AnalysisHistoryRepository;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CodeAnalysisServiceTest {

    private final LMStudioClient lmStudioClient =
            mock(LMStudioClient.class);

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    private final AnalysisHistoryRepository analysisHistoryRepository =
            mock(AnalysisHistoryRepository.class);

    private final CodeAnalysisService service =
            new CodeAnalysisService(
                    lmStudioClient,
                    objectMapper,
                    analysisHistoryRepository
            );

    @Test
    void shouldReturnDetailedExplanation() {

        CodeAnalysisRequest request = new CodeAnalysisRequest(
                "java",
                AnalysisType.EXPLAIN,
                "public int add(int a, int b) {\n"
                        + "    return a + b;\n"
                        + "}"
        );

        String aiJson = """
                {
                  "analysisType": "EXPLAIN",
                  "summary": "Adds two integers.",
                  "findings": [],
                  "suggestedFix": null,
                  "generatedTests": [],
                  "explanation": {
                    "lineByLine": [
                      {
                        "lineNumber": 1,
                        "code": "public int add(int a, int b) {",
                        "explanation": "Declares a method that accepts two integers."
                      },
                      {
                        "lineNumber": 2,
                        "code": "    return a + b;",
                        "explanation": "Adds and returns both values."
                      },
                      {
                        "lineNumber": 3,
                        "code": "}",
                        "explanation": "Closes the method body."
                      }
                    ],
                    "parameters": [
                      "a: int - first integer",
                      "b: int - second integer"
                    ],
                    "returnValue": "The sum as an integer.",
                    "executionFlow": [
                      "Receive two integer arguments",
                      "Evaluate a + b",
                      "Return the result"
                    ],
                    "exampleInput": "add(5, 3)",
                    "exampleOutput": "8",
                    "exampleExplanation": "5 + 3 equals 8.",
                    "timeComplexity": "O(1)",
                    "spaceComplexity": "O(1)",
                    "notes": []
                  }
                }
                """;

        when(lmStudioClient.generate(anyString(), anyString()))
                .thenReturn(aiJson);

        CodeAnalysisResponse response = service.analyze(request);

        assertNotNull(response);
        assertEquals(AnalysisType.EXPLAIN, response.analysisType());
        assertEquals("Adds two integers.", response.summary());
        assertNotNull(response.explanation());

        assertEquals(
                3,
                response.explanation().lineByLine().size()
        );

        assertEquals(
                "8",
                response.explanation().exampleOutput()
        );

        assertEquals(
                "The sum as an integer.",
                response.explanation().returnValue()
        );

        assertFalse(response.findings().size() > 0);
        assertNull(response.suggestedFix());

        verifyGenerateCall();

        verify(analysisHistoryRepository, times(1))
                .save(any(AnalysisHistory.class));
    }

    @Test
    void shouldReturnGeneratedTestScenarios() {

        CodeAnalysisRequest request = new CodeAnalysisRequest(
                "java",
                AnalysisType.GENERATE_TESTS,
                "public int add(int a, int b) {\n"
                        + "    return a + b;\n"
                        + "}"
        );

        String aiJson = """
                {
                  "analysisType": "GENERATE_TESTS",
                  "summary": "Unit test scenarios for addition.",
                  "findings": [],
                  "suggestedFix": null,
                  "generatedTests": [
                    "Test adding two positive integers",
                    "Test adding negative integers",
                    "Test adding zero"
                  ],
                  "explanation": null
                }
                """;

        when(lmStudioClient.generate(anyString(), anyString()))
                .thenReturn(aiJson);

        CodeAnalysisResponse response = service.analyze(request);

        assertNotNull(response);

        assertEquals(
                AnalysisType.GENERATE_TESTS,
                response.analysisType()
        );

        assertEquals(
                "Unit test scenarios for addition.",
                response.summary()
        );

        assertFalse(response.generatedTests().isEmpty());
        assertEquals(3, response.generatedTests().size());

        verify(lmStudioClient, times(1))
                .generate(anyString(), anyString());

        verify(analysisHistoryRepository, times(1))
                .save(any(AnalysisHistory.class));
    }

    @Test
    void shouldRejectNullRequest() {

        assertThrows(
                IllegalArgumentException.class,
                () -> service.analyze(null)
        );
    }

    @Test
    void shouldRejectBlankSourceCode() {

        CodeAnalysisRequest request = new CodeAnalysisRequest(
                "java",
                AnalysisType.EXPLAIN,
                "   "
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> service.analyze(request)
        );
    }

    @Test
    void shouldRejectInvalidAiJson() {

        CodeAnalysisRequest request = new CodeAnalysisRequest(
                "java",
                AnalysisType.GENERATE_TESTS,
                "int add(int a, int b) { return a + b; }"
        );

        when(lmStudioClient.generate(anyString(), anyString()))
                .thenReturn("This is not valid JSON");

        assertThrows(
                IllegalStateException.class,
                () -> service.analyze(request)
        );

        verify(analysisHistoryRepository, times(0))
                .save(any(AnalysisHistory.class));
    }

    private void verifyGenerateCall() {

        verify(lmStudioClient, times(1))
                .generate(anyString(), anyString());
    }
}
