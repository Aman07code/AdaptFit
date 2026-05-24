USE adaptfit_db;

INSERT INTO exercises
(name, description, workout_type, equipment, muscle_group, duration_minutes, intensity, calories_estimate)
VALUES
('Light Stretch Routine', 'Gentle full-body mobility flow for recovery days.', 'LIGHT', 'NONE', 'Full Body', 10, 'LOW', 50),
('Walking Intervals', 'Alternating easy and brisk walking intervals.', 'CARDIO', 'NONE', 'Cardio', 15, 'LOW', 110),
('Bodyweight Squats', 'Controlled squats focused on form and tempo.', 'STRENGTH', 'NONE', 'Legs', 10, 'MODERATE', 90),
('Push-Ups', 'Classic upper-body pushing exercise.', 'STRENGTH', 'NONE', 'Chest', 8, 'MODERATE', 80),
('Compact HIIT Circuit', 'Short high-intensity bodyweight circuit.', 'CARDIO', 'NONE', 'Full Body', 12, 'HIGH', 160),
('Yoga Flow', 'Low-impact flow to improve mobility and breathing.', 'MOBILITY', 'NONE', 'Full Body', 15, 'LOW', 70),
('Jump Rope Intervals', 'Fast cardio intervals using a jump rope.', 'CARDIO', 'JUMP_ROPE', 'Cardio', 12, 'HIGH', 180),
('Dumbbell Rows', 'Single-arm rows for back and posture strength.', 'STRENGTH', 'DUMBBELLS', 'Back', 12, 'MODERATE', 100),
('Dumbbell Press', 'Standing or floor dumbbell press for upper-body strength.', 'STRENGTH', 'DUMBBELLS', 'Shoulders', 12, 'MODERATE', 105),
('Resistance Band Pull Aparts', 'Band movement for shoulders and upper back.', 'STRENGTH', 'RESISTANCE_BAND', 'Shoulders', 8, 'LOW', 55),
('Kettlebell Swings', 'Powerful hinge movement for conditioning and strength.', 'STRENGTH', 'KETTLEBELL', 'Posterior Chain', 14, 'HIGH', 170);
