package com.adaptfit.dto;

import com.adaptfit.entity.WorkoutGoal;
import com.adaptfit.entity.WorkoutType;

import java.util.List;

public record WorkoutRecommendationResponse(
        String recommendationName,
        WorkoutType workoutType,
        WorkoutGoal goal,
        Integer availableTimeMinutes,
        Integer estimatedDurationMinutes,
        String intensity,
        List<String> equipmentUsed,
        String recommendationReason,
        List<ExerciseResponse> exercises
) {
}
