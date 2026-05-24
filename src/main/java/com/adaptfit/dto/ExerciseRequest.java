package com.adaptfit.dto;

import com.adaptfit.entity.IntensityLevel;
import com.adaptfit.entity.WorkoutType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExerciseRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 140, message = "Name must be at most 140 characters")
        String name,

        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description,

        @NotNull(message = "Workout type is required")
        WorkoutType workoutType,

        @NotBlank(message = "Equipment is required. Use NONE for bodyweight exercises")
        @Size(max = 80, message = "Equipment must be at most 80 characters")
        String equipment,

        @NotBlank(message = "Muscle group is required")
        @Size(max = 80, message = "Muscle group must be at most 80 characters")
        String muscleGroup,

        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Duration must be at least 1 minute")
        @Max(value = 240, message = "Duration must be at most 240 minutes")
        Integer durationMinutes,

        @NotNull(message = "Intensity is required")
        IntensityLevel intensity,

        @NotNull(message = "Calories estimate is required")
        @Min(value = 0, message = "Calories estimate cannot be negative")
        Integer caloriesEstimate
) {
}
