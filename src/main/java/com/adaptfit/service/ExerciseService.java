package com.adaptfit.service;

import com.adaptfit.dto.ExerciseRequest;
import com.adaptfit.dto.ExerciseResponse;
import com.adaptfit.entity.Exercise;
import com.adaptfit.exception.ResourceNotFoundException;
import com.adaptfit.repository.ExerciseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional
    public ExerciseResponse addExercise(ExerciseRequest request) {
        Exercise exercise = new Exercise(
                request.name().trim(),
                clean(request.description()),
                request.workoutType(),
                normalizeEquipment(request.equipment()),
                request.muscleGroup().trim(),
                request.durationMinutes(),
                request.intensity(),
                request.caloriesEstimate()
        );

        return ExerciseResponse.from(exerciseRepository.save(exercise));
    }

    @Transactional
    public ExerciseResponse updateExercise(Long id, ExerciseRequest request) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id " + id));

        exercise.setName(request.name().trim());
        exercise.setDescription(clean(request.description()));
        exercise.setWorkoutType(request.workoutType());
        exercise.setEquipment(normalizeEquipment(request.equipment()));
        exercise.setMuscleGroup(request.muscleGroup().trim());
        exercise.setDurationMinutes(request.durationMinutes());
        exercise.setIntensity(request.intensity());
        exercise.setCaloriesEstimate(request.caloriesEstimate());

        return ExerciseResponse.from(exercise);
    }

    @Transactional
    public void deleteExercise(Long id) {
        if (!exerciseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exercise not found with id " + id);
        }

        exerciseRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponse> getAllExercises() {
        return exerciseRepository.findAll().stream()
                .map(ExerciseResponse::from)
                .toList();
    }

    private String normalizeEquipment(String equipment) {
        return equipment.trim().replace(' ', '_').toUpperCase(Locale.ROOT);
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
