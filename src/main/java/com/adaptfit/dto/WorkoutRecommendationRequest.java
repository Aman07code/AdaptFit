package com.adaptfit.dto;

import com.adaptfit.entity.EnergyLevel;
import com.adaptfit.entity.RecoveryLevel;
import com.adaptfit.entity.WorkoutGoal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record WorkoutRecommendationRequest(
        @NotNull(message = "Energy level is required")
        EnergyLevel energyLevel,

        @NotNull(message = "Recovery level is required")
        RecoveryLevel recoveryLevel,

        @NotNull(message = "Workout goal is required")
        WorkoutGoal goal,

        @NotNull(message = "Available equipment is required")
        @Size(min = 1, message = "Provide at least one equipment item. Use NONE for bodyweight workouts")
        List<@NotBlank(message = "Equipment item cannot be blank") String> availableEquipment,

        @NotNull(message = "Available workout time is required")
        @Min(value = 5, message = "Available workout time must be at least 5 minutes")
        @Max(value = 240, message = "Available workout time must be at most 240 minutes")
        Integer availableTimeMinutes
) {
}
