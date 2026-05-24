package com.adaptfit.dto;

import com.adaptfit.entity.EnergyLevel;
import com.adaptfit.entity.RecoveryLevel;
import com.adaptfit.entity.WorkoutGoal;
import com.adaptfit.entity.WorkoutType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public record SaveWorkoutHistoryRequest(
        @NotNull(message = "User id is required")
        Long userId,

        @NotBlank(message = "Workout name is required")
        @Size(max = 140, message = "Workout name must be at most 140 characters")
        String workoutName,

        @NotNull(message = "Workout goal is required")
        WorkoutGoal goal,

        @NotNull(message = "Workout type is required")
        WorkoutType workoutType,

        @NotEmpty(message = "Exercise ids are required")
        List<@NotNull(message = "Exercise id cannot be null") Long> exerciseIds,

        @NotNull(message = "Actual duration is required")
        @Min(value = 1, message = "Actual duration must be at least 1 minute")
        @Max(value = 240, message = "Actual duration must be at most 240 minutes")
        Integer actualDurationMinutes,

        EnergyLevel energyLevel,
        RecoveryLevel recoveryLevel,
        LocalDateTime performedAt,

        @Size(max = 1000, message = "Feedback must be at most 1000 characters")
        String feedback,

        @Size(max = 1000, message = "Notes must be at most 1000 characters")
        String notes
) {
}
