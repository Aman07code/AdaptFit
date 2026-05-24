package com.adaptfit.controller;

import com.adaptfit.dto.SaveWorkoutHistoryRequest;
import com.adaptfit.dto.WorkoutHistoryResponse;
import com.adaptfit.service.WorkoutHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workout-history")
public class WorkoutHistoryController {

    private final WorkoutHistoryService workoutHistoryService;

    public WorkoutHistoryController(WorkoutHistoryService workoutHistoryService) {
        this.workoutHistoryService = workoutHistoryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutHistoryResponse saveWorkoutHistory(@Valid @RequestBody SaveWorkoutHistoryRequest request) {
        return workoutHistoryService.saveWorkoutHistory(request);
    }

    @GetMapping("/users/{userId}")
    public List<WorkoutHistoryResponse> getWorkoutHistory(@PathVariable Long userId) {
        return workoutHistoryService.getWorkoutHistory(userId);
    }
}
