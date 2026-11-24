package com.adaptfit.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String[] CANDIDATE_MODELS = {
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-120b"
    };

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> request) {
        try {
            String userMessage = (String) request.get("message");
            String userName = (String) request.getOrDefault("userName", "User");

            String systemPrompt = "You are an expert AI fitness trainer built into AdaptFit.\n" +
                "User name: " + userName + "\n" +
                "Give personalized fitness, workout, and nutrition advice.\n" +
                "Keep responses concise, friendly, and motivating.\n" +
                "Use emojis occasionally. Keep responses under 150 words.";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            List<Map<String, String>> messages = new ArrayList<>();

            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", systemPrompt);
            messages.add(systemMsg);

            List<Map<String, String>> history = (List<Map<String, String>>) request.getOrDefault("history", new ArrayList<>());
            messages.addAll(history);

            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);

            Map<String, Object> groqRequest = new HashMap<>();
            groqRequest.put("messages", messages);
            groqRequest.put("max_tokens", 300);
            groqRequest.put("temperature", 0.7);

            Exception lastException = null;

            for (String model : CANDIDATE_MODELS) {
                try {
                    groqRequest.put("model", model);
                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(groqRequest, headers);

                    ResponseEntity<Map> groqResponse = restTemplate.postForEntity(
                        "https://api.groq.com/openai/v1/chat/completions",
                        entity,
                        Map.class
                    );

                    Map<String, Object> body = groqResponse.getBody();
                    if (body != null && body.containsKey("choices")) {
                        List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                        if (!choices.isEmpty()) {
                            Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
                            String reply = (String) msg.get("content");
                            Map<String, String> response = new HashMap<>();
                            response.put("reply", reply);
                            return ResponseEntity.ok(response);
                        }
                    }
                } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
                    Map<String, String> response = new HashMap<>();
                    response.put("reply", "⚠️ The AI Chatbot API key is expired or missing. Please check your `GROQ_API_KEY` on Render!");
                    return ResponseEntity.ok(response);
                } catch (Exception e) {
                    lastException = e;
                    // continue to next model
                }
            }

            Map<String, String> response = new HashMap<>();
            response.put("reply", "⚠️ Groq API Error: " + (lastException != null ? lastException.getMessage() : "All models failed"));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("reply", "⚠️ Unable to process chat request: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
