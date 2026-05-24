package com.adaptfit.controller;

import com.adaptfit.dto.WorkoutRecommendationRequest;
import com.adaptfit.dto.WorkoutRecommendationResponse;
import com.adaptfit.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/workouts")
    public WorkoutRecommendationResponse generateWorkoutRecommendation(@Valid @RequestBody WorkoutRecommendationRequest request) {
        return recommendationService.generateRecommendation(request);
    }
}
