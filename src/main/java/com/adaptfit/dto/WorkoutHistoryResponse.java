package com.adaptfit.dto;

import com.adaptfit.entity.EnergyLevel;
import com.adaptfit.entity.RecoveryLevel;
import com.adaptfit.entity.WorkoutGoal;
import com.adaptfit.entity.WorkoutHistory;
import com.adaptfit.entity.WorkoutType;

import java.time.LocalDateTime;
import java.util.List;

public record WorkoutHistoryResponse(
        Long id,
        Long userId,
        Long workoutId,
        String workoutName,
        WorkoutGoal goal,
        WorkoutType workoutType,
        Integer actualDurationMinutes,
        EnergyLevel energyLevel,
        RecoveryLevel recoveryLevel,
        LocalDateTime performedAt,
        String feedback,
        String notes,
        List<ExerciseResponse> exercises
) {
    public static WorkoutHistoryResponse from(WorkoutHistory history) {
        return new WorkoutHistoryResponse(
                history.getId(),
                history.getUser().getId(),
                history.getWorkout().getId(),
                history.getWorkout().getName(),
                history.getWorkout().getGoal(),
                history.getWorkout().getWorkoutType(),
                history.getActualDurationMinutes(),
                history.getEnergyLevel(),
                history.getRecoveryLevel(),
                history.getPerformedAt(),
                history.getFeedback(),
                history.getNotes(),
                history.getWorkout().getExercises().stream()
                        .map(ExerciseResponse::from)
                        .toList()
        );
    }
}
