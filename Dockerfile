# Build stage
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk
COPY --from=build /target/adaptfit-0.0.1-SNAPSHOT.jar adaptfit.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "adaptfit.jar"]
