# ──────────────────────────────────────────────────────────────
#  Étape 1 : build (Maven + JDK 17)
# ──────────────────────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /build

# Copie du pom puis des sources, build sans tests (les tests tournent en CI)
COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests

# ──────────────────────────────────────────────────────────────
#  Étape 2 : runtime (JRE 17 Alpine, utilisateur non-root)
# ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Utilisateur non privilégié (bonne pratique sécurité / attendu par Trivy)
RUN addgroup -S app && adduser -S app -G app

COPY --from=build /build/target/*.jar app.jar
RUN chown -R app:app /app
USER app

EXPOSE 8080

# wget est fourni par busybox dans l'image Alpine — pas d'installation nécessaire
HEALTHCHECK --interval=15s --timeout=3s --start-period=45s --retries=5 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
