package com.adaptfit.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private WorkoutType workoutType;

    @Column(nullable = false, length = 80)
    private String equipment;

    @Column(nullable = false, length = 80)
    private String muscleGroup;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private IntensityLevel intensity;

    @Column(nullable = false)
    private Integer caloriesEstimate;

    public Exercise() {
    }

    public Exercise(String name, String description, WorkoutType workoutType, String equipment, String muscleGroup,
                    Integer durationMinutes, IntensityLevel intensity, Integer caloriesEstimate) {
        this.name = name;
        this.description = description;
        this.workoutType = workoutType;
        this.equipment = equipment;
        this.muscleGroup = muscleGroup;
        this.durationMinutes = durationMinutes;
        this.intensity = intensity;
        this.caloriesEstimate = caloriesEstimate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public WorkoutType getWorkoutType() {
        return workoutType;
    }

    public void setWorkoutType(WorkoutType workoutType) {
        this.workoutType = workoutType;
    }

    public String getEquipment() {
        return equipment;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public String getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(String muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public IntensityLevel getIntensity() {
        return intensity;
    }

    public void setIntensity(IntensityLevel intensity) {
        this.intensity = intensity;
    }

    public Integer getCaloriesEstimate() {
        return caloriesEstimate;
    }

    public void setCaloriesEstimate(Integer caloriesEstimate) {
        this.caloriesEstimate = caloriesEstimate;
    }
}
