package com.adaptfit.repository;

import com.adaptfit.entity.WorkoutHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutHistoryRepository extends JpaRepository<WorkoutHistory, Long> {

    List<WorkoutHistory> findByUser_IdOrderByPerformedAtDesc(Long userId);
}
