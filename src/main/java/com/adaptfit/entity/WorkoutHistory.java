package com.adaptfit.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "workout_history")
public class WorkoutHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    @Column(nullable = false)
    private LocalDateTime performedAt;

    @Column(nullable = false)
    private Integer actualDurationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private EnergyLevel energyLevel;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private RecoveryLevel recoveryLevel;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public WorkoutHistory() {
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.performedAt == null) {
            this.performedAt = this.createdAt;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Workout getWorkout() {
        return workout;
    }

    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }

    public Integer getActualDurationMinutes() {
        return actualDurationMinutes;
    }

    public void setActualDurationMinutes(Integer actualDurationMinutes) {
        this.actualDurationMinutes = actualDurationMinutes;
    }

    public EnergyLevel getEnergyLevel() {
        return energyLevel;
    }

    public void setEnergyLevel(EnergyLevel energyLevel) {
        this.energyLevel = energyLevel;
    }

    public RecoveryLevel getRecoveryLevel() {
        return recoveryLevel;
    }

    public void setRecoveryLevel(RecoveryLevel recoveryLevel) {
        this.recoveryLevel = recoveryLevel;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
