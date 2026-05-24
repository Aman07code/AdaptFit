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
            throw new BadRequestException("No exercises are available. Add exercises before generating recommendations");
        }

        WorkoutType targetType = decideWorkoutType(request);
        Set<String> availableEquipment = normalizeEquipment(request.availableEquipment());

        List<Exercise> candidates = allExercises.stream()
                .filter(exercise -> matchesEquipment(exercise, availableEquipment))
                .filter(exercise -> isTypeCompatible(exercise, targetType))
                .sorted(recommendationSorter(targetType))
                .toList();

        if (candidates.isEmpty()) {
            candidates = allExercises.stream()
                    .filter(exercise -> matchesEquipment(exercise, availableEquipment))
                    .sorted(recommendationSorter(targetType))
                    .toList();
        }

        if (candidates.isEmpty()) {
            candidates = allExercises.stream()
                    .filter(exercise -> "NONE".equalsIgnoreCase(exercise.getEquipment()))
                    .sorted(recommendationSorter(targetType))
                    .toList();
        }

        if (candidates.isEmpty()) {
            throw new BadRequestException("No exercises match the available equipment");
        }

        List<Exercise> selected = selectWithinTime(candidates, request.availableTimeMinutes());
        int estimatedDuration = selected.stream()
                .mapToInt(Exercise::getDurationMinutes)
                .sum();

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
                recommendationReason(request, targetType),
                selected.stream().map(ExerciseResponse::from).toList()
        );
    }

    private WorkoutType decideWorkoutType(WorkoutRecommendationRequest request) {
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
                    .comparing((Exercise exercise) -> intensityRank(exercise.getIntensity()))
                    .thenComparing(Exercise::getDurationMinutes);
            case STRENGTH -> Comparator
                    .comparing((Exercise exercise) -> intensityRank(exercise.getIntensity())).reversed()
                    .thenComparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder());
            case CARDIO -> Comparator
                    .comparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder())
                    .thenComparing(Exercise::getDurationMinutes);
            case COMPACT -> Comparator
                    .comparing(Exercise::getDurationMinutes)
                    .thenComparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder());
            case MIXED -> Comparator
                    .comparing(Exercise::getDurationMinutes)
                    .thenComparing((Exercise exercise) -> intensityRank(exercise.getIntensity()));
        };
    }

    private int intensityRank(IntensityLevel intensity) {
        return switch (intensity) {
            case LOW -> 1;
            case MODERATE -> 2;
            case HIGH -> 3;
        };
    }

    private boolean matchesEquipment(Exercise exercise, Set<String> availableEquipment) {
        return availableEquipment.contains(exercise.getEquipment().toUpperCase(Locale.ROOT));
    }

    private Set<String> normalizeEquipment(List<String> availableEquipment) {
        Set<String> normalized = new LinkedHashSet<>();
        for (String equipment : availableEquipment) {
            normalized.add(equipment.trim().replace(' ', '_').toUpperCase(Locale.ROOT));
        }
        normalized.add("NONE");
        return normalized;
    }

    private String describeIntensity(List<Exercise> exercises) {
        double average = exercises.stream()
                .mapToInt(exercise -> intensityRank(exercise.getIntensity()))
                .average()
                .orElse(1);

        if (average >= 2.5) {
            return "HIGH";
        }
        if (average >= 1.6) {
            return "MODERATE";
        }
        return "LOW";
    }

    private String recommendationName(WorkoutType workoutType, WorkoutGoal goal) {
        String readableType = workoutType.name().replace('_', ' ').toLowerCase(Locale.ROOT);
        String readableGoal = goal.name().replace('_', ' ').toLowerCase(Locale.ROOT);
        return "Adaptive " + readableType + " workout for " + readableGoal;
    }

    private String recommendationReason(WorkoutRecommendationRequest request, WorkoutType workoutType) {
        return switch (workoutType) {
            case LIGHT -> "Low energy or low recovery detected, so AdaptFit selected a lighter session.";
            case COMPACT -> "Available time is short, so AdaptFit selected compact exercises that fit the window.";
            case CARDIO -> "Fat loss goal detected, so AdaptFit prioritized cardio-focused exercises.";
            case STRENGTH -> "High energy and muscle gain goal detected, so AdaptFit prioritized strength work.";
            case MOBILITY -> "Flexibility goal detected, so AdaptFit selected mobility-focused exercises.";
            case MIXED -> "Inputs are balanced, so AdaptFit selected a mixed full-body workout.";
        };
    }
}
