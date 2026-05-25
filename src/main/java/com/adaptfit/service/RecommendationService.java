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
            throw new BadRequestException("No exercises available. Add exercises first.");
        }

        WorkoutType targetType = decideWorkoutType(request);
        Set<String> availableEquipment = normalizeEquipment(request.availableEquipment());
        Set<String> injuredGroups = normalizeSet(request.injuredMuscleGroups());
        Set<String> targetGroups = normalizeSet(request.targetMuscleGroups());

        // Step 1 — Filter by equipment + injuries + type + target muscles
        List<Exercise> candidates = allExercises.stream()
                .filter(e -> matchesEquipment(e, availableEquipment))
                .filter(e -> !isInjured(e, injuredGroups))
                .filter(e -> isTypeCompatible(e, targetType))
                .filter(e -> matchesTarget(e, targetGroups))
                .sorted(recommendationSorter(targetType))
                .toList();

        // Step 2 — Relax type filter but keep equipment + injuries + target
        if (candidates.isEmpty()) {
            candidates = allExercises.stream()
                    .filter(e -> matchesEquipment(e, availableEquipment))
                    .filter(e -> !isInjured(e, injuredGroups))
                    .filter(e -> matchesTarget(e, targetGroups))
                    .sorted(recommendationSorter(targetType))
                    .toList();
        }

        // Step 3 — Relax target filter but keep equipment + injuries
        if (candidates.isEmpty()) {
            candidates = allExercises.stream()
                    .filter(e -> matchesEquipment(e, availableEquipment))
                    .filter(e -> !isInjured(e, injuredGroups))
                    .filter(e -> isTypeCompatible(e, targetType))
                    .sorted(recommendationSorter(targetType))
                    .toList();
        }

        // Step 4 — Last resort: bodyweight only + no injuries
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
                    ? "No exercises match your equipment. Please add more exercises."
                    : "No exercises available avoiding injured areas with your equipment."
            );
        }

        List<Exercise> selected = selectWithinTime(candidates, request.availableTimeMinutes());
        int estimatedDuration = selected.stream().mapToInt(Exercise::getDurationMinutes).sum();
        List<String> equipmentUsed = selected.stream().map(Exercise::getEquipment).distinct().toList();

        return new WorkoutRecommendationResponse(
                recommendationName(targetType, request.goal()),
                targetType,
                request.goal(),
                request.availableTimeMinutes(),
                estimatedDuration,
                describeIntensity(selected),
                equipmentUsed,
                recommendationReason(request, targetType, injuredGroups, targetGroups),
                selected.stream().map(ExerciseResponse::from).toList()
        );
    }

    private WorkoutType decideWorkoutType(WorkoutRecommendationRequest request) {
        if (request.energyLevel() == EnergyLevel.LOW || request.recoveryLevel() == RecoveryLevel.LOW) return WorkoutType.LIGHT;
        if (request.availableTimeMinutes() <= 20) return WorkoutType.COMPACT;
        if (request.goal() == WorkoutGoal.FAT_LOSS) return WorkoutType.CARDIO;
        if (request.energyLevel() == EnergyLevel.HIGH && request.goal() == WorkoutGoal.MUSCLE_GAIN) return WorkoutType.STRENGTH;
        if (request.goal() == WorkoutGoal.FLEXIBILITY) return WorkoutType.MOBILITY;
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

    private boolean isInjured(Exercise exercise, Set<String> injuredGroups) {
        if (injuredGroups == null || injuredGroups.isEmpty()) return false;
        String mg = exercise.getMuscleGroup();
        if (mg == null) return false;
        String normalized = mg.trim().toUpperCase(Locale.ROOT);
        return injuredGroups.stream().anyMatch(i -> normalized.contains(i) || i.contains(normalized));
    }

    private boolean matchesTarget(Exercise exercise, Set<String> targetGroups) {
        if (targetGroups == null || targetGroups.isEmpty()) return true;
        String mg = exercise.getMuscleGroup();
        if (mg == null) return false;
        String normalized = mg.trim().toUpperCase(Locale.ROOT);
        return targetGroups.stream().anyMatch(t -> normalized.contains(t) || t.contains(normalized));
    }

    private Set<String> normalizeEquipment(List<String> list) {
        Set<String> normalized = new LinkedHashSet<>();
        if (list != null) {
            for (String s : list) normalized.add(s.trim().replace(' ', '_').toUpperCase(Locale.ROOT));
        }
        normalized.add("NONE");
        return normalized;
    }

    private Set<String> normalizeSet(List<String> list) {
        Set<String> normalized = new LinkedHashSet<>();
        if (list == null) return normalized;
        for (String s : list) normalized.add(s.trim().toUpperCase(Locale.ROOT));
        return normalized;
    }

    private List<Exercise> selectWithinTime(List<Exercise> candidates, int availableTimeMinutes) {
        List<Exercise> selected = new ArrayList<>();
        int total = 0;
        for (Exercise e : candidates) {
            if (total + e.getDurationMinutes() <= availableTimeMinutes) {
                selected.add(e);
                total += e.getDurationMinutes();
            }
        }
        if (selected.isEmpty()) selected.add(candidates.get(0));
        return selected;
    }

    private Comparator<Exercise> recommendationSorter(WorkoutType targetType) {
        return switch (targetType) {
            case LIGHT, MOBILITY -> Comparator.comparing((Exercise e) -> intensityRank(e.getIntensity())).thenComparing(Exercise::getDurationMinutes);
            case STRENGTH -> Comparator.comparing((Exercise e) -> intensityRank(e.getIntensity())).reversed().thenComparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder());
            case CARDIO -> Comparator.comparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder()).thenComparing(Exercise::getDurationMinutes);
            case COMPACT -> Comparator.comparing(Exercise::getDurationMinutes).thenComparing(Exercise::getCaloriesEstimate, Comparator.reverseOrder());
            case MIXED -> Comparator.comparing(Exercise::getDurationMinutes).thenComparing((Exercise e) -> intensityRank(e.getIntensity()));
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
        double avg = exercises.stream().mapToInt(e -> intensityRank(e.getIntensity())).average().orElse(1);
        if (avg >= 2.5) return "HIGH";
        if (avg >= 1.6) return "MODERATE";
        return "LOW";
    }

    private String recommendationName(WorkoutType workoutType, WorkoutGoal goal) {
        return "Adaptive " + workoutType.name().replace('_', ' ').toLowerCase() + " workout for " + goal.name().replace('_', ' ').toLowerCase();
    }

    private String recommendationReason(WorkoutRecommendationRequest request, WorkoutType workoutType, Set<String> injuredGroups, Set<String> targetGroups) {
        String base = switch (workoutType) {
            case LIGHT -> "Low energy or recovery detected — AdaptFit selected a lighter session.";
            case COMPACT -> "Short time available — AdaptFit selected compact exercises.";
            case CARDIO -> "Fat loss goal detected — AdaptFit prioritized cardio exercises.";
            case STRENGTH -> "High energy + muscle gain goal — AdaptFit prioritized strength work.";
            case MOBILITY -> "Flexibility goal detected — AdaptFit selected mobility exercises.";
            case MIXED -> "Balanced inputs — AdaptFit selected a mixed full-body workout.";
        };
        if (!targetGroups.isEmpty()) {
            base += " Focused on: " + String.join(", ", targetGroups).toLowerCase() + ".";
        }
        if (!injuredGroups.isEmpty()) {
            base += " Excluded: " + String.join(", ", injuredGroups).toLowerCase() + " due to injury.";
        }
        return base;
    }
}
