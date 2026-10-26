
package com.example.ai_code_reviewer.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Component
public class LMStudioClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String model;
    private final double temperature;
    private final int maxTokens;

    public LMStudioClient(
            RestClient.Builder builder,
            ObjectMapper objectMapper,
            @Value("${lmstudio.base-url}") String baseUrl,
            @Value("${lmstudio.model}") String model,
            @Value("${lmstudio.temperature:0.1}") double temperature,
            @Value("${lmstudio.max-tokens:4096}") int maxTokens) {

        this.restClient = builder
                .baseUrl(baseUrl)
                .build();

        this.objectMapper = objectMapper;
        this.model = model;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
    }

    public String generate(String systemPrompt, String userPrompt) {

        Map<String, Object> request = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", systemPrompt
                        ),
                        Map.of(
                                "role", "user",
                                "content", userPrompt
                        )
                ),
                "temperature", temperature,
                "max_tokens", maxTokens,
                "stream", false,
                "response_format", Map.of(
                        "type", "text"
                )
        );

        try {
            // application.properties base URL includes /v1.
            // Final endpoint: http://localhost:1235/v1/chat/completions
            String rawResponse = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(String.class);

            if (rawResponse == null || rawResponse.isBlank()) {
                throw new IllegalStateException(
                        "LM Studio returned an empty HTTP response."
                );
            }

            JsonNode response = objectMapper.readTree(rawResponse);
            JsonNode choices = response.path("choices");

            if (!choices.isArray() || choices.isEmpty()) {
                throw new IllegalStateException(
                        "LM Studio returned no choices. Response: "
                                + rawResponse
                );
            }

            JsonNode choice = choices.path(0);

            String finishReason = choice
                    .path("finish_reason")
                    .asString("");

            if ("length".equalsIgnoreCase(finishReason)) {
                throw new IllegalStateException(
                        "LM Studio reached the output token limit ("
                                + maxTokens
                                + "). Increase lmstudio.max-tokens or "
                                + "shorten the requested analysis."
                );
            }

            JsonNode contentNode = choice
                    .path("message")
                    .path("content");

            String content = contentNode.asString("");

            if (content.isBlank()) {
                throw new IllegalStateException(
                        "LM Studio returned no generated content. "
                                + "Response: " + rawResponse
                );
            }

            return content.trim();

        } catch (RestClientResponseException exception) {
            throw new IllegalStateException(
                    "LM Studio HTTP error: "
                            + exception.getStatusCode()
                            + ". Response: "
                            + exception.getResponseBodyAsString(),
                    exception
            );

        } catch (IllegalStateException exception) {
            throw exception;

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Failed to read the response from LM Studio: "
                            + exception.getMessage(),
                    exception
            );
        }
    }
}
