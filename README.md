# AdaptFit Backend

AdaptFit is a Spring Boot backend for adaptive workout recommendations. It uses MySQL, Maven, Spring Data JPA, validation, DTOs, exception handling, CORS configuration, password hashing, and signed JWTs returned from registration/login.

## Tech Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Data JPA
- MySQL
- Maven
- Bean Validation

## Folder Structure

```text
AdaptFit/
├── pom.xml
├── README.md
├── sql/
│   ├── schema.sql
│   └── seed.sql
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── adaptfit/
        │           ├── AdaptFitApplication.java
        │           ├── config/
        │           ├── controller/
        │           ├── dto/
        │           ├── entity/
        │           ├── exception/
        │           ├── repository/
        │           └── service/
        └── resources/
            └── application.properties
```

## Setup

1. Create or start a MySQL server.

2. Update database credentials in `src/main/resources/application.properties` if your local MySQL user/password are different:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

3. Run the app:

```bash
mvn spring-boot:run
```

The application runs at:

```text
http://localhost:8080
```

Hibernate is configured with `ddl-auto=update`, so tables are created automatically. You can also run `sql/schema.sql` manually if you prefer explicit schema creation. Default exercise data is inserted automatically on first startup if the exercise table is empty.

## Enums

Use these enum values in JSON requests:

```text
EnergyLevel: LOW, MEDIUM, HIGH
RecoveryLevel: LOW, MEDIUM, HIGH
WorkoutGoal: FAT_LOSS, MUSCLE_GAIN, ENDURANCE, FLEXIBILITY, GENERAL_FITNESS
WorkoutType: LIGHT, STRENGTH, CARDIO, COMPACT, MOBILITY, MIXED
IntensityLevel: LOW, MODERATE, HIGH
```

Equipment is stored as uppercase text. Examples: `NONE`, `DUMBBELLS`, `JUMP_ROPE`, `RESISTANCE_BAND`, `KETTLEBELL`.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/recommendations/workouts` | Generate workout recommendation |
| POST | `/api/exercises` | Add exercise |
| PUT | `/api/exercises/{id}` | Update exercise |
| DELETE | `/api/exercises/{id}` | Delete exercise |
| GET | `/api/exercises` | Get all exercises |
| POST | `/api/workout-history` | Save workout history |
| GET | `/api/workout-history/users/{userId}` | Get workout history |

## Sample Requests and Responses

### Register

Request:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "StrongPass123"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "createdAt": "2026-05-09T10:30:00"
  }
}
```

### Login

Request:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "aarav@example.com",
  "password": "StrongPass123"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "createdAt": "2026-05-09T10:30:00"
  }
}
```

### Add Exercise

Request:

```http
POST /api/exercises
Content-Type: application/json
```

```json
{
  "name": "Dumbbell Lunges",
  "description": "Lower-body strength exercise using dumbbells.",
  "workoutType": "STRENGTH",
  "equipment": "DUMBBELLS",
  "muscleGroup": "Legs",
  "durationMinutes": 12,
  "intensity": "MODERATE",
  "caloriesEstimate": 110
}
```

Response:

```json
{
  "id": 12,
  "name": "Dumbbell Lunges",
  "description": "Lower-body strength exercise using dumbbells.",
  "workoutType": "STRENGTH",
  "equipment": "DUMBBELLS",
  "muscleGroup": "Legs",
  "durationMinutes": 12,
  "intensity": "MODERATE",
  "caloriesEstimate": 110
}
```

### Update Exercise

```http
PUT /api/exercises/12
Content-Type: application/json
```

```json
{
  "name": "Dumbbell Reverse Lunges",
  "description": "Reverse lunge variation for controlled lower-body strength.",
  "workoutType": "STRENGTH",
  "equipment": "DUMBBELLS",
  "muscleGroup": "Legs",
  "durationMinutes": 10,
  "intensity": "MODERATE",
  "caloriesEstimate": 105
}
```

### Delete Exercise

```http
DELETE /api/exercises/12
```

Successful response:

```text
204 No Content
```

### Get All Exercises

```http
GET /api/exercises
```

Response:

```json
[
  {
    "id": 1,
    "name": "Light Stretch Routine",
    "description": "Gentle full-body mobility flow for recovery days.",
    "workoutType": "LIGHT",
    "equipment": "NONE",
    "muscleGroup": "Full Body",
    "durationMinutes": 10,
    "intensity": "LOW",
    "caloriesEstimate": 50
  }
]
```

### Generate Workout Recommendation

Request:

```http
POST /api/recommendations/workouts
Content-Type: application/json
```

```json
{
  "energyLevel": "HIGH",
  "recoveryLevel": "HIGH",
  "goal": "MUSCLE_GAIN",
  "availableEquipment": ["DUMBBELLS", "NONE"],
  "availableTimeMinutes": 35
}
```

Response:

```json
{
  "recommendationName": "Adaptive strength workout for muscle gain",
  "workoutType": "STRENGTH",
  "goal": "MUSCLE_GAIN",
  "availableTimeMinutes": 35,
  "estimatedDurationMinutes": 34,
  "intensity": "MODERATE",
  "equipmentUsed": ["DUMBBELLS", "NONE"],
  "recommendationReason": "High energy and muscle gain goal detected, so AdaptFit prioritized strength work.",
  "exercises": [
    {
      "id": 9,
      "name": "Dumbbell Press",
      "description": "Standing or floor dumbbell press for upper-body strength.",
      "workoutType": "STRENGTH",
      "equipment": "DUMBBELLS",
      "muscleGroup": "Shoulders",
      "durationMinutes": 12,
      "intensity": "MODERATE",
      "caloriesEstimate": 105
    },
    {
      "id": 8,
      "name": "Dumbbell Rows",
      "description": "Single-arm rows for back and posture strength.",
      "workoutType": "STRENGTH",
      "equipment": "DUMBBELLS",
      "muscleGroup": "Back",
      "durationMinutes": 12,
      "intensity": "MODERATE",
      "caloriesEstimate": 100
    },
    {
      "id": 3,
      "name": "Bodyweight Squats",
      "description": "Controlled squats focused on form and tempo.",
      "workoutType": "STRENGTH",
      "equipment": "NONE",
      "muscleGroup": "Legs",
      "durationMinutes": 10,
      "intensity": "MODERATE",
      "caloriesEstimate": 90
    }
  ]
}
```

Recommendation rules:

- Low energy or low recovery selects a light workout.
- High energy with muscle gain selects a strength workout.
- Fat loss selects a cardio workout.
- Short available time, 20 minutes or less, selects a compact workout.
- Exercises are filtered by available equipment. `NONE` is always included for bodyweight fallback.

### Save Workout History

Request:

```http
POST /api/workout-history
Content-Type: application/json
```

```json
{
  "userId": 1,
  "workoutName": "Morning Strength Session",
  "goal": "MUSCLE_GAIN",
  "workoutType": "STRENGTH",
  "exerciseIds": [3, 4, 8],
  "actualDurationMinutes": 30,
  "energyLevel": "HIGH",
  "recoveryLevel": "MEDIUM",
  "performedAt": "2026-05-09T07:30:00",
  "feedback": "Felt strong on rows.",
  "notes": "Increase dumbbell weight next time."
}
```

Response:

```json
{
  "id": 1,
  "userId": 1,
  "workoutId": 1,
  "workoutName": "Morning Strength Session",
  "goal": "MUSCLE_GAIN",
  "workoutType": "STRENGTH",
  "actualDurationMinutes": 30,
  "energyLevel": "HIGH",
  "recoveryLevel": "MEDIUM",
  "performedAt": "2026-05-09T07:30:00",
  "feedback": "Felt strong on rows.",
  "notes": "Increase dumbbell weight next time.",
  "exercises": [
    {
      "id": 3,
      "name": "Bodyweight Squats",
      "description": "Controlled squats focused on form and tempo.",
      "workoutType": "STRENGTH",
      "equipment": "NONE",
      "muscleGroup": "Legs",
      "durationMinutes": 10,
      "intensity": "MODERATE",
      "caloriesEstimate": 90
    }
  ]
}
```

### Get Workout History

```http
GET /api/workout-history/users/1
```

Response:

```json
[
  {
    "id": 1,
    "userId": 1,
    "workoutId": 1,
    "workoutName": "Morning Strength Session",
    "goal": "MUSCLE_GAIN",
    "workoutType": "STRENGTH",
    "actualDurationMinutes": 30,
    "energyLevel": "HIGH",
    "recoveryLevel": "MEDIUM",
    "performedAt": "2026-05-09T07:30:00",
    "feedback": "Felt strong on rows.",
    "notes": "Increase dumbbell weight next time.",
    "exercises": [
      {
        "id": 3,
        "name": "Bodyweight Squats",
        "description": "Controlled squats focused on form and tempo.",
        "workoutType": "STRENGTH",
        "equipment": "NONE",
        "muscleGroup": "Legs",
        "durationMinutes": 10,
        "intensity": "MODERATE",
        "caloriesEstimate": 90
      }
    ]
  }
]
```

## Error Response Format

```json
{
  "timestamp": "2026-05-09T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/exercises",
  "validationErrors": {
    "name": "Name is required"
  }
}
```

## Build Check

```bash
mvn clean compile
```

## Frontend

A React frontend is included in `frontend/`. It uses plain HTML, CSS, JavaScript, and React UMD scripts, so it does not require `npm install`.

Run it from the frontend folder:

```bash
cd frontend
node server.js
```

Open:

```text
http://localhost:5173
```

The frontend calls the backend at `http://localhost:8080` by default. You can change the backend URL from the Account screen.
