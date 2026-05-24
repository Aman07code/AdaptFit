package com.adaptfit.config;

import com.adaptfit.entity.Exercise;
import com.adaptfit.entity.IntensityLevel;
import com.adaptfit.entity.WorkoutType;
import com.adaptfit.repository.ExerciseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedExerciseData(ExerciseRepository exerciseRepository) {
        return args -> {
            if (exerciseRepository.count() > 0) {
                return;
            }

            exerciseRepository.saveAll(List.of(
                    new Exercise("Light Stretch Routine", "Gentle full-body mobility flow for recovery days.", WorkoutType.LIGHT, "NONE", "Full Body", 10, IntensityLevel.LOW, 50),
                    new Exercise("Walking Intervals", "Alternating easy and brisk walking intervals.", WorkoutType.CARDIO, "NONE", "Cardio", 15, IntensityLevel.LOW, 110),
                    new Exercise("Bodyweight Squats", "Controlled squats focused on form and tempo.", WorkoutType.STRENGTH, "NONE", "Legs", 10, IntensityLevel.MODERATE, 90),
                    new Exercise("Push-Ups", "Classic upper-body pushing exercise.", WorkoutType.STRENGTH, "NONE", "Chest", 8, IntensityLevel.MODERATE, 80),
                    new Exercise("Compact HIIT Circuit", "Short high-intensity bodyweight circuit.", WorkoutType.CARDIO, "NONE", "Full Body", 12, IntensityLevel.HIGH, 160),
                    new Exercise("Yoga Flow", "Low-impact flow to improve mobility and breathing.", WorkoutType.MOBILITY, "NONE", "Full Body", 15, IntensityLevel.LOW, 70),
                    new Exercise("Jump Rope Intervals", "Fast cardio intervals using a jump rope.", WorkoutType.CARDIO, "JUMP_ROPE", "Cardio", 12, IntensityLevel.HIGH, 180),
                    new Exercise("Dumbbell Rows", "Single-arm rows for back and posture strength.", WorkoutType.STRENGTH, "DUMBBELLS", "Back", 12, IntensityLevel.MODERATE, 100),
                    new Exercise("Dumbbell Press", "Standing or floor dumbbell press for upper-body strength.", WorkoutType.STRENGTH, "DUMBBELLS", "Shoulders", 12, IntensityLevel.MODERATE, 105),
                    new Exercise("Resistance Band Pull Aparts", "Band movement for shoulders and upper back.", WorkoutType.STRENGTH, "RESISTANCE_BAND", "Shoulders", 8, IntensityLevel.LOW, 55),
                    new Exercise("Kettlebell Swings", "Powerful hinge movement for conditioning and strength.", WorkoutType.STRENGTH, "KETTLEBELL", "Posterior Chain", 14, IntensityLevel.HIGH, 170)
            ));
        };
    }
}
