# 📦 StockIQ — Système de Gestion de Stock

Application web full-stack de gestion d'inventaire : produits, mouvements de stock
(entrées / sorties / transferts), alertes de seuil, tableau de bord, rapports et
gestion des utilisateurs. Sécurité par authentification JWT.

**Stack** : Spring Boot 3.2 (Java 17) · React 19 + Vite · MySQL 8 · Docker · GitLab CI/CD (SAST/DAST/SCA).

---

## 🚀 Démarrage rapide (recommandé : Docker)

Une seule commande lève toute la stack (MySQL + backend + frontend) et crée
automatiquement un compte administrateur :

```bash
cp .env.example .env      # puis adaptez les mots de passe dans .env
docker compose up --build
```

- Application : **http://localhost**
- Connexion par défaut : `admin` / *(valeur de `DEFAULT_ADMIN_PASSWORD` dans `.env`)*

Pour tout arrêter et nettoyer :

```bash
docker compose down -v
```

## 🧰 Démarrage manuel (sans Docker)

Voir le guide détaillé : **[docs/GUIDE-UTILISATION.md](docs/GUIDE-UTILISATION.md)**.
En résumé (⚠️ nécessite **JDK 17** et une base MySQL) :

```bash
# Backend — le compte admin doit être activé explicitement, sinon connexion impossible
export DEFAULT_ADMIN_ENABLED=true
export DEFAULT_ADMIN_PASSWORD=admin123
cd demo && JAVA_HOME=$(/usr/libexec/java_home -v 17) ./mvnw spring-boot:run

# Frontend (autre terminal)
cd frontend && npm install && npm run dev
```

## 🔐 DevSecOps & CI/CD

Le pipeline GitLab (`.gitlab-ci.yml`) exécute : lint/build → tests → **SAST (SonarQube)**
→ build d'images → **SCA (Trivy)** → **DAST (OWASP ZAP)**. Détails et mise en place
dans **[docs/GUIDE-UTILISATION.md](docs/GUIDE-UTILISATION.md)**.

## 📚 Documentation

- **[Guide d'utilisation et de configuration](docs/GUIDE-UTILISATION.md)** — installation, config, dépannage, DevSecOps
- API interactive (Swagger) : `http://localhost:8080/swagger-ui.html` (backend démarré)
- Diagrammes UML : `docs/uml/`
