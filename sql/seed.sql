USE adaptfit_db;

INSERT INTO exercises
(name, description, workout_type, equipment, muscle_group, duration_minutes, intensity, calories_estimate)
VALUES
-- ==================== EXISTING EXERCISES ====================
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
('Kettlebell Swings', 'Powerful hinge movement for conditioning and strength.', 'STRENGTH', 'KETTLEBELL', 'Posterior Chain', 14, 'HIGH', 170),

-- ==================== BODYWEIGHT — CHEST ====================
('Diamond Push-Ups', 'Narrow grip push-ups targeting the inner chest and triceps.', 'STRENGTH', 'NONE', 'Chest', 8, 'MODERATE', 85),
('Wide Push-Ups', 'Wide grip push-ups for outer chest activation.', 'STRENGTH', 'NONE', 'Chest', 8, 'MODERATE', 80),
('Decline Push-Ups', 'Feet elevated push-ups targeting upper chest.', 'STRENGTH', 'NONE', 'Chest', 10, 'HIGH', 95),
('Incline Push-Ups', 'Hands elevated push-ups for lower chest and beginners.', 'LIGHT', 'NONE', 'Chest', 8, 'LOW', 60),

-- ==================== BODYWEIGHT — BACK ====================
('Superman Hold', 'Lie face down and lift arms and legs for lower back strength.', 'STRENGTH', 'NONE', 'Back', 8, 'LOW', 50),
('Reverse Snow Angels', 'Lying face down arm circles for upper back activation.', 'MOBILITY', 'NONE', 'Back', 7, 'LOW', 45),
('Doorframe Rows', 'Using a doorframe for bodyweight row simulation.', 'STRENGTH', 'NONE', 'Back', 10, 'MODERATE', 75),

-- ==================== BODYWEIGHT — LEGS ====================
('Lunges', 'Alternating forward lunges for quad and glute strength.', 'STRENGTH', 'NONE', 'Legs', 10, 'MODERATE', 95),
('Glute Bridges', 'Hip thrust movement targeting glutes and hamstrings.', 'STRENGTH', 'NONE', 'Legs', 10, 'MODERATE', 80),
('Wall Sit', 'Isometric squat hold for quad endurance.', 'STRENGTH', 'NONE', 'Legs', 8, 'MODERATE', 70),
('Jump Squats', 'Explosive squat jumps for power and cardio.', 'CARDIO', 'NONE', 'Legs', 10, 'HIGH', 130),
('Calf Raises', 'Standing calf raises for lower leg strength.', 'STRENGTH', 'NONE', 'Legs', 7, 'LOW', 50),
('Step-Ups', 'Stepping onto an elevated surface for leg strength.', 'STRENGTH', 'NONE', 'Legs', 10, 'MODERATE', 90),
('Single Leg Deadlift', 'Balance-focused hip hinge for hamstrings and stability.', 'STRENGTH', 'NONE', 'Legs', 10, 'MODERATE', 85),

-- ==================== BODYWEIGHT — CORE ====================
('Plank Hold', 'Core stability exercise holding a straight body position.', 'STRENGTH', 'NONE', 'Core', 7, 'MODERATE', 60),
('Crunches', 'Classic ab exercise for upper core strength.', 'STRENGTH', 'NONE', 'Core', 8, 'MODERATE', 65),
('Bicycle Crunches', 'Rotating crunch targeting obliques and core.', 'STRENGTH', 'NONE', 'Core', 8, 'MODERATE', 75),
('Leg Raises', 'Lying leg raises for lower ab strength.', 'STRENGTH', 'NONE', 'Core', 8, 'MODERATE', 70),
('Mountain Climbers', 'Fast-paced core and cardio exercise.', 'CARDIO', 'NONE', 'Core', 8, 'HIGH', 110),
('Russian Twists', 'Seated rotating movement for oblique strength.', 'STRENGTH', 'NONE', 'Core', 8, 'MODERATE', 70),
('Dead Bug', 'Core stability exercise with opposing arm and leg movement.', 'LIGHT', 'NONE', 'Core', 8, 'LOW', 55),
('Side Plank', 'Lateral plank for oblique and hip strength.', 'STRENGTH', 'NONE', 'Core', 7, 'MODERATE', 60),

-- ==================== BODYWEIGHT — SHOULDERS & ARMS ====================
('Pike Push-Ups', 'Downward dog position push-ups targeting shoulders.', 'STRENGTH', 'NONE', 'Shoulders', 8, 'MODERATE', 80),
('Tricep Dips', 'Using a chair or bench for tricep strength.', 'STRENGTH', 'NONE', 'Arms', 8, 'MODERATE', 75),
('Arm Circles', 'Dynamic shoulder warm-up and mobility exercise.', 'LIGHT', 'NONE', 'Shoulders', 5, 'LOW', 30),

-- ==================== CARDIO — BODYWEIGHT ====================
('Burpees', 'Full body explosive movement combining squat, plank and jump.', 'CARDIO', 'NONE', 'Full Body', 10, 'HIGH', 150),
('High Knees', 'Running in place with high knee drives for cardio.', 'CARDIO', 'NONE', 'Cardio', 8, 'HIGH', 120),
('Jumping Jacks', 'Classic full body warm-up and cardio exercise.', 'CARDIO', 'NONE', 'Full Body', 7, 'LOW', 70),
('Box Jumps', 'Explosive jump onto an elevated surface for power.', 'CARDIO', 'NONE', 'Legs', 10, 'HIGH', 140),
('Shadow Boxing', 'Punching combinations in the air for cardio and coordination.', 'CARDIO', 'NONE', 'Full Body', 12, 'MODERATE', 130),
('Bear Crawls', 'Moving on all fours for full body strength and coordination.', 'CARDIO', 'NONE', 'Full Body', 8, 'HIGH', 120),

-- ==================== DUMBBELLS ====================
('Dumbbell Bicep Curls', 'Classic curl movement for bicep strength and size.', 'STRENGTH', 'DUMBBELLS', 'Arms', 10, 'MODERATE', 90),
('Dumbbell Tricep Extension', 'Overhead extension for tricep strength.', 'STRENGTH', 'DUMBBELLS', 'Arms', 10, 'MODERATE', 85),
('Dumbbell Lateral Raises', 'Side raises for lateral deltoid development.', 'STRENGTH', 'DUMBBELLS', 'Shoulders', 10, 'MODERATE', 80),
('Dumbbell Lunges', 'Weighted lunges for quad and glute strength.', 'STRENGTH', 'DUMBBELLS', 'Legs', 12, 'MODERATE', 110),
('Dumbbell Romanian Deadlift', 'Hip hinge movement for hamstring and glute strength.', 'STRENGTH', 'DUMBBELLS', 'Legs', 12, 'MODERATE', 115),
('Dumbbell Chest Fly', 'Lying fly movement for chest stretch and strength.', 'STRENGTH', 'DUMBBELLS', 'Chest', 10, 'MODERATE', 95),
('Dumbbell Shrugs', 'Shoulder elevation movement for trap development.', 'STRENGTH', 'DUMBBELLS', 'Back', 8, 'MODERATE', 80),
('Dumbbell Front Raises', 'Forward raises for anterior deltoid strength.', 'STRENGTH', 'DUMBBELLS', 'Shoulders', 10, 'MODERATE', 85),
('Dumbbell Goblet Squat', 'Squat holding a dumbbell at chest for quad and core.', 'STRENGTH', 'DUMBBELLS', 'Legs', 12, 'MODERATE', 105),
('Dumbbell Bent Over Row', 'Bilateral row for upper back thickness.', 'STRENGTH', 'DUMBBELLS', 'Back', 12, 'MODERATE', 110),
('Dumbbell Hammer Curl', 'Neutral grip curl for brachialis and bicep strength.', 'STRENGTH', 'DUMBBELLS', 'Arms', 10, 'MODERATE', 90),
('Dumbbell Step-Ups', 'Weighted step-ups for unilateral leg strength.', 'STRENGTH', 'DUMBBELLS', 'Legs', 12, 'MODERATE', 115),

-- ==================== RESISTANCE BAND ====================
('Band Squats', 'Squat with resistance band above knees for glute activation.', 'STRENGTH', 'RESISTANCE_BAND', 'Legs', 10, 'MODERATE', 90),
('Band Bicep Curls', 'Standing curl using resistance band.', 'STRENGTH', 'RESISTANCE_BAND', 'Arms', 10, 'MODERATE', 75),
('Band Tricep Pushdown', 'Overhead band extension for tricep strength.', 'STRENGTH', 'RESISTANCE_BAND', 'Arms', 10, 'MODERATE', 70),
('Band Lateral Walk', 'Sideways walking with band for glute medius activation.', 'STRENGTH', 'RESISTANCE_BAND', 'Legs', 10, 'LOW', 65),
('Band Face Pulls', 'Pulling band to face for rear delt and rotator cuff health.', 'STRENGTH', 'RESISTANCE_BAND', 'Shoulders', 8, 'LOW', 55),
('Band Chest Press', 'Pressing motion with band for chest and shoulder strength.', 'STRENGTH', 'RESISTANCE_BAND', 'Chest', 10, 'MODERATE', 80),
('Band Rows', 'Rowing motion with band for back strength.', 'STRENGTH', 'RESISTANCE_BAND', 'Back', 10, 'MODERATE', 75),
('Band Glute Kickbacks', 'Hip extension with band for glute isolation.', 'STRENGTH', 'RESISTANCE_BAND', 'Legs', 10, 'LOW', 60),
('Band Shoulder Press', 'Overhead press with band for shoulder strength.', 'STRENGTH', 'RESISTANCE_BAND', 'Shoulders', 10, 'MODERATE', 80),

-- ==================== KETTLEBELL ====================
('Kettlebell Goblet Squat', 'Deep squat holding kettlebell at chest for legs and core.', 'STRENGTH', 'KETTLEBELL', 'Legs', 12, 'MODERATE', 115),
('Kettlebell Deadlift', 'Hip hinge with kettlebell for posterior chain strength.', 'STRENGTH', 'KETTLEBELL', 'Legs', 12, 'MODERATE', 120),
('Kettlebell Turkish Get-Up', 'Complex full body movement for stability and strength.', 'STRENGTH', 'KETTLEBELL', 'Full Body', 15, 'HIGH', 160),
('Kettlebell Clean', 'Power movement pulling kettlebell to rack position.', 'STRENGTH', 'KETTLEBELL', 'Full Body', 12, 'HIGH', 150),
('Kettlebell Halo', 'Circular overhead movement for shoulder mobility.', 'MOBILITY', 'KETTLEBELL', 'Shoulders', 8, 'LOW', 60),
('Kettlebell Rows', 'Single arm row with kettlebell for back strength.', 'STRENGTH', 'KETTLEBELL', 'Back', 12, 'MODERATE', 110),
('Kettlebell Press', 'Overhead press for shoulder and core strength.', 'STRENGTH', 'KETTLEBELL', 'Shoulders', 12, 'MODERATE', 105),
('Kettlebell Lunges', 'Weighted lunges with kettlebell for leg strength.', 'STRENGTH', 'KETTLEBELL', 'Legs', 12, 'MODERATE', 115),

-- ==================== JUMP ROPE ====================
('Jump Rope Basic', 'Standard two-foot jump rope for cardio.', 'CARDIO', 'JUMP_ROPE', 'Cardio', 10, 'MODERATE', 140),
('Jump Rope Double Unders', 'Advanced rope passes twice per jump for intensity.', 'CARDIO', 'JUMP_ROPE', 'Cardio', 10, 'HIGH', 200),
('Jump Rope Single Leg', 'Hopping on one leg for balance and calf strength.', 'CARDIO', 'JUMP_ROPE', 'Legs', 8, 'HIGH', 160),
('Jump Rope Boxer Step', 'Side to side weight shift jump rope for rhythm.', 'CARDIO', 'JUMP_ROPE', 'Cardio', 10, 'MODERATE', 150),

-- ==================== MOBILITY & RECOVERY ====================
('Hip Flexor Stretch', 'Kneeling lunge stretch for hip flexor flexibility.', 'MOBILITY', 'NONE', 'Legs', 8, 'LOW', 30),
('Hamstring Stretch', 'Seated or standing hamstring flexibility work.', 'MOBILITY', 'NONE', 'Legs', 8, 'LOW', 30),
('Thoracic Rotation', 'Seated or lying rotation for upper back mobility.', 'MOBILITY', 'NONE', 'Back', 8, 'LOW', 35),
('Shoulder Mobility Flow', 'Dynamic arm swings and circles for shoulder health.', 'MOBILITY', 'NONE', 'Shoulders', 8, 'LOW', 35),
('Pigeon Pose', 'Deep hip opener for glute and hip flexibility.', 'MOBILITY', 'NONE', 'Legs', 10, 'LOW', 30),
('Cat Cow Stretch', 'Spinal flexion and extension for back mobility.', 'MOBILITY', 'NONE', 'Back', 7, 'LOW', 25),
('Child Pose Flow', 'Resting stretch for lower back and hip relief.', 'LIGHT', 'NONE', 'Back', 8, 'LOW', 25),
('Neck Mobility Routine', 'Gentle neck rolls and stretches for tension relief.', 'LIGHT', 'NONE', 'Full Body', 5, 'LOW', 20),
('Wrist and Ankle Circles', 'Joint mobility work for wrists and ankles.', 'LIGHT', 'NONE', 'Full Body', 5, 'LOW', 20),
('Full Body Foam Roll', 'Self-myofascial release for muscle recovery.', 'LIGHT', 'NONE', 'Full Body', 12, 'LOW', 40);
