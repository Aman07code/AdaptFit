package com.adaptfit.service;

import com.adaptfit.dto.SaveWorkoutHistoryRequest;
import com.adaptfit.dto.WorkoutHistoryResponse;
import com.adaptfit.entity.Exercise;
import com.adaptfit.entity.User;
import com.adaptfit.entity.Workout;
import com.adaptfit.entity.WorkoutHistory;
import com.adaptfit.exception.ResourceNotFoundException;
import com.adaptfit.repository.ExerciseRepository;
import com.adaptfit.repository.UserRepository;
import com.adaptfit.repository.WorkoutHistoryRepository;
import com.adaptfit.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class WorkoutHistoryService {

    private final WorkoutHistoryRepository workoutHistoryRepository;
    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutHistoryService(WorkoutHistoryRepository workoutHistoryRepository,
                                 WorkoutRepository workoutRepository,
                                 UserRepository userRepository,
                                 ExerciseRepository exerciseRepository) {
        this.workoutHistoryRepository = workoutHistoryRepository;
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional
    public WorkoutHistoryResponse saveWorkoutHistory(SaveWorkoutHistoryRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + request.userId()));

        Set<Long> requestedIds = new LinkedHashSet<>(request.exerciseIds());
        List<Exercise> exercises = exerciseRepository.findAllById(requestedIds);
        if (exercises.size() != requestedIds.size()) {
            throw new ResourceNotFoundException("One or more exercises were not found");
        }

        Workout workout = new Workout();
        workout.setName(request.workoutName().trim());
        workout.setGoal(request.goal());
        workout.setWorkoutType(request.workoutType());
        workout.setTotalDurationMinutes(request.actualDurationMinutes());
        workout.setNotes(clean(request.notes()));
        workout.setUser(user);
        workout.setExercises(exercises);

        Workout savedWorkout = workoutRepository.save(workout);

        WorkoutHistory history = new WorkoutHistory();
        history.setUser(user);
        history.setWorkout(savedWorkout);
        history.setActualDurationMinutes(request.actualDurationMinutes());
        history.setEnergyLevel(request.energyLevel());
        history.setRecoveryLevel(request.recoveryLevel());
        history.setPerformedAt(request.performedAt() == null ? LocalDateTime.now() : request.performedAt());
        history.setFeedback(clean(request.feedback()));
        history.setNotes(clean(request.notes()));

        return WorkoutHistoryResponse.from(workoutHistoryRepository.save(history));
    }

    @Transactional(readOnly = true)
    public List<WorkoutHistoryResponse> getWorkoutHistory(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id " + userId);
        }

        return workoutHistoryRepository.findByUser_IdOrderByPerformedAtDesc(userId).stream()
                .map(WorkoutHistoryResponse::from)
                .toList();
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
