package com.adaptfit.dto;

import com.adaptfit.entity.EnergyLevel;
import com.adaptfit.entity.RecoveryLevel;
import com.adaptfit.entity.WorkoutGoal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record WorkoutRecommendationRequest(
        @NotNull EnergyLevel energyLevel,
        @NotNull RecoveryLevel recoveryLevel,
        @NotNull WorkoutGoal goal,
        @NotNull List<String> availableEquipment,
        @Min(10) @Max(180) int availableTimeMinutes,
        List<String> injuredMuscleGroups
) {
}
