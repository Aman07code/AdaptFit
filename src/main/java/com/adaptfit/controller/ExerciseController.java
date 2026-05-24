package com.adaptfit.controller;

import com.adaptfit.dto.ExerciseRequest;
import com.adaptfit.dto.ExerciseResponse;
import com.adaptfit.service.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExerciseResponse addExercise(@Valid @RequestBody ExerciseRequest request) {
        return exerciseService.addExercise(request);
    }

    @PutMapping("/{id}")
    public ExerciseResponse updateExercise(@PathVariable Long id, @Valid @RequestBody ExerciseRequest request) {
        return exerciseService.updateExercise(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<ExerciseResponse> getAllExercises() {
        return exerciseService.getAllExercises();
    }
}
