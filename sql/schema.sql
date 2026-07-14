
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(140) NOT NULL,
    description TEXT,
    workout_type VARCHAR(40) NOT NULL,
    equipment VARCHAR(80) NOT NULL,
    muscle_group VARCHAR(80) NOT NULL,
    duration_minutes INT NOT NULL,
    intensity VARCHAR(40) NOT NULL,
    calories_estimate INT NOT NULL
);

CREATE TABLE IF NOT EXISTS workouts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(140) NOT NULL,
    goal VARCHAR(40) NOT NULL,
    workout_type VARCHAR(40) NOT NULL,
    total_duration_minutes INT NOT NULL,
    notes TEXT,
    user_id BIGINT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_workouts_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workout_exercises (
    workout_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    PRIMARY KEY (workout_id, exercise_id),
    CONSTRAINT fk_workout_exercises_workout FOREIGN KEY (workout_id) REFERENCES workouts(id),
    CONSTRAINT fk_workout_exercises_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS workout_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    workout_id BIGINT NOT NULL,
    performed_at DATETIME(6) NOT NULL,
    actual_duration_minutes INT NOT NULL,
    energy_level VARCHAR(40),
    recovery_level VARCHAR(40),
    feedback TEXT,
    notes TEXT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_workout_history_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_workout_history_workout FOREIGN KEY (workout_id) REFERENCES workouts(id)
);
