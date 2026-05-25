package com.adaptfit.service;

import com.adaptfit.dto.ExerciseResponse;
import com.adaptfit.dto.WorkoutRecommendationRequest;
import com.adaptfit.dto.WorkoutRecommendationResponse;
import com.adaptfit.entity.EnergyLevel;
import com.adaptfit.entity.Exercise;
import com.adaptfit.entity.IntensityLevel;
import com.adaptfit.entity.RecoveryLevel;
import com.adaptfit.entity.WorkoutGoal;
import com.adaptfit.entity.WorkoutType;
import com.adaptfit.exception.BadRequestException;
import com.adaptfit.repository.ExerciseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class RecommendationService {

    private final ExerciseRepository exerciseRepository;

    public RecommendationService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public WorkoutRecommendationResponse generateRecommendation(WorkoutRecommendationRequest request) {
        List<Exercise> allExercises = exerciseRepository.findAll();
        if (allExercises.isEmpty()) {
            throw new BadRequestException("No exercises available. Add exercises before generating recommendations.");
        }

        WorkoutType targetType = decideWorkoutType(request);
        Set<String> availableEquipment = normalizeEquipment(request.availableEquipment());
        Set<String> injuredGroups = normalizeInjuries(request.injuredMuscleGroups());

        // Step 1 — Filter by equipment (strict) and exclude injured muscle groups
        List<Exercise> candidates = allExercises.stream()
                .filter(e -> matchesEquipment(e, availableEquipment))
                .filter(e -> !isInjured(e, injuredGroups))
                .filter(e -> isTypeCompatible(e, targetType))
                .sorted(recommendationSorter(targetType))
                .toList();;

        // Step 2 — If no candidates with type filter, relax type but keep equipment + injury filters
        if (candidates.isEmpty()) {
            candidates = allExercises.stream()
                    .filter(e -> matchesEquipment(e, availableEquipment))
                    .filter(e -> !isInjured(e, injuredGroups))
                    .sorted(recommendationSorter(targetType))
                    .toList();
        }

        // Step 3 — Last resort: bodyweight only + no injuries
        if (candidates.isEmpty()) {
            candidates = allExercises.stream()
                    .filter(e -> "NONE".equalsIgnoreCase(e.getEquipment()))
                    .filter(e -> !isInjured(e, injuredGroups))
                    .sorted(recommendationSorter(targetType))
                    .toList();
        }

        if (candidates.isEmpty()) {
            throw new BadRequestException(
                injuredGroups.isEmpty()
                    ? "No exercises match your available equipment. Please add more exercises."
                    : "No exercises available that avoid your injured muscle groups with your equipment."
            );
        }

        List<Exercise> selected = selectWithinTime(candidates, request.availableTimeMinutes());
        int estimatedDuration = selected.stream().mapToInt(Exercise::getDurationMinutes).sum();

        List<String> equipmentUsed = selected.stream()
                .map(Exercise::getEquipment)
                .distinct()
                .toList();

        return new WorkoutRecommendationResponse(
                recommendationName(targetType, request.goal()),
                targetType,
                request.goal(),
                request.availableTimeMinutes(),
                estimatedDuration,
                describeIntensity(selected),
                equipmentUsed,
                recommendationReason(request, targetType, injuredGroups),
                selected.stream().map(ExerciseResponse::from).toList()
        );
    }

    private WorkoutType decideWorkoutType(WorkoutRecommendationRequest request) {
        // Injured users always get light workout
        List<String> injuries = request.injuredMuscleGroups();
        if (injuries != null && !injuries.isEmpty()) {
            if (request.energyLevel() == EnergyLevel.LOW || request.recoveryLevel() == RecoveryLevel.LOW) {
                return WorkoutType.LIGHT;
            }
        }

        if (request.energyLevel() == EnergyLevel.LOW || request.recoveryLevel() == RecoveryLevel.LOW) {
            return WorkoutType.LIGHT;
        }
        if (request.availableTimeMinutes() <= 20) {
            return WorkoutType.COMPACT;
        }
        if (request.goal() == WorkoutGoal.FAT_LOSS) {
            return WorkoutType.CARDIO;
        }
        if (request.energyLevel() == EnergyLevel.HIGH && request.goal() == WorkoutGoal.MUSCLE_GAIN) {
            return WorkoutType.STRENGTH;
        }
        if (request.goal() == WorkoutGoal.FLEXIBILITY) {
            return WorkoutType.MOBILITY;
        }
        return WorkoutType.MIXED;
    }

    private boolean isTypeCompatible(Exercise exercise, WorkoutType targetType) {
        return switch (targetType) {
            case LIGHT -> exercise.getWorkoutType() == WorkoutType.LIGHT || exercise.getIntensity() == IntensityLevel.LOW;
            case COMPACT -> exercise.getDurationMinutes() <= 12;
            case STRENGTH -> exercise.getWorkoutType() == WorkoutType.STRENGTH;
            case CARDIO -> exercise.getWorkoutType() == WorkoutType.CARDIO;
            case MOBILITY -> exercise.getWorkoutType() == WorkoutType.MOBILITY || exercise.getWorkoutType() == WorkoutType.LIGHT;
            case MIXED -> true;
        };
    }

    private boolean matchesEquipment(Exercise exercise, Set<String> availableEquipment) {
        return availableEquipment.contains(exercise.getEquipment().toUpperCase(Locale.ROOT));
    }

    // Check if exercise targets an injured muscle group
    private boolean isInjured(Exercise exercise, Set<String> injuredGroups) {
        if (injuredGroups == null || injuredGroups.isEmpty()) return false;
        String muscleGroup = exercise.getMuscleGroup();
        if (muscleGroup == null) return false;
        String normalized = muscleGroup.trim().toUpperCase(Locale.ROOT);
        return injuredGroups.stream().anyMatch(injury ->
            normalized.contains(injury) || injury.contains(normalized)
        );
    }

    private Set<String> normalizeEquipment(List<String> availableEquipment) {
        Set<String> normalized = new LinkedHashSet<>();
        if (availableEquipment != null) {
            for (String equipment : availableEquipment) {
                normalized.add(equipment.trim().replace(' ', '_').toUpperCase(Locale.ROOT));
            }
        }
        normalized.add("NONE");
        return normalized;
    }

    private Set<String> normalizeInjuries(List<String> injuries) {
        Set<String> normalized = new LinkedHashSet<>();
        if (injuries == null) return normalized;
        for (String injury : injuries) {
            normalized.add(injury.trim().toUpperCase(Locale.ROOT));
        }
        return normalized;
    }

    private List<Exercise> selectWithinTime(List<Exercise> candidates, int availableTimeMinutes) {
        List<Exercise> selected = new ArrayList<>();
        int runningTotal = 0;
        for (Exercise exercise : candidates) {
            if (runningTotal + exercise.getDurationMinutes() <= availableTimeMinutes) {
                selected.add(exercise);
                runningTotal += exercise.getDurationMinutes();
            }
        }
        if (selected.isEmpty()) {
            selected.add(candidates.get(0));
        }
        return selected;
    }

    private Comparator<Exercise> recommendationSorter(WorkoutType targetType) {
        return switch (targetType) {
            case LIGHT, MOBILITY -> Comparator
                    .comparing((Exercise e) -> intensityRank(e.getIntensity()))
                    .thenComparing(Exercise::getDurationMinutes);
            case STRENGTH -> Comparator
                    .comparing((Exercise e) -> intensityRank(e.getIntensity())).reversed()
                    .thenComparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder());
            case CARDIO -> Comparator
                    .comparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder())
                    .thenComparing(Exercise::getDurationMinutes);
            case COMPACT -> Comparator
                    .comparing(Exercise::getDurationMinutes)
                    .thenComparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder());
            case MIXED -> Comparator
                    .comparing(Exercise::getDurationMinutes)
                    .thenComparing((Exercise e) -> intensityRank(e.getIntensity()));
        };
    }

    private int intensityRank(IntensityLevel intensity) {
        return switch (intensity) {
            case LOW -> 1;
            case MODERATE -> 2;
            case HIGH -> 3;
        };
    }

    private String describeIntensity(List<Exercise> exercises) {
        double average = exercises.stream()
                .mapToInt(e -> intensityRank(e.getIntensity()))
                .average()
                .orElse(1);
        if (average >= 2.5) return "HIGH";
        if (average >= 1.6) return "MODERATE";
        return "LOW";
    }

    private String recommendationName(WorkoutType workoutType, WorkoutGoal goal) {
        String readableType = workoutType.name().replace('_', ' ').toLowerCase(Locale.ROOT);
        String readableGoal = goal.name().replace('_', ' ').toLowerCase(Locale.ROOT);
        return "Adaptive " + readableType + " workout for " + readableGoal;
    }

    private String recommendationReason(WorkoutRecommendationRequest request, WorkoutType workoutType, Set<String> injuredGroups) {
        String base = switch (workoutType) {
            case LIGHT -> "Low energy or low recovery detected, so AdaptFit selected a lighter session.";
            case COMPACT -> "Available time is short, so AdaptFit selected compact exercises.";
            case CARDIO -> "Fat loss goal detected, so AdaptFit prioritized cardio exercises.";
            case STRENGTH -> "High energy and muscle gain goal detected, so AdaptFit prioritized strength work.";
            case MOBILITY -> "Flexibility goal detected, so AdaptFit selected mobility exercises.";
            case MIXED -> "Inputs are balanced, so AdaptFit selected a mixed full-body workout.";
        };
        if (!injuredGroups.isEmpty()) {
            base += " Exercises targeting " + String.join(", ", injuredGroups).toLowerCase() + " have been excluded due to reported injury.";
        }
        return base;
    }
}
