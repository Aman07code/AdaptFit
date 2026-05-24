package com.adaptfit.dto;

import com.adaptfit.entity.Exercise;
import com.adaptfit.entity.IntensityLevel;
import com.adaptfit.entity.WorkoutType;

public record ExerciseResponse(
        Long id,
        String name,
        String description,
        WorkoutType workoutType,
        String equipment,
        String muscleGroup,
        Integer durationMinutes,
        IntensityLevel intensity,
        Integer caloriesEstimate
) {
    public static ExerciseResponse from(Exercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getDescription(),
                exercise.getWorkoutType(),
                exercise.getEquipment(),
                exercise.getMuscleGroup(),
                exercise.getDurationMinutes(),
                exercise.getIntensity(),
                exercise.getCaloriesEstimate()
        );
    }
}
