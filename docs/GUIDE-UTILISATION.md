# 📘 StockIQ — Guide d'utilisation et de configuration

Guide complet pour installer, configurer, utiliser et exploiter l'application
**StockIQ** (Système de Gestion de Stock), ainsi que sa chaîne DevSecOps.

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Architecture](#2-architecture)
3. [Prérequis](#3-prérequis)
4. [Installation & démarrage](#4-installation--démarrage)
   - [4.1 Avec Docker (recommandé)](#41-avec-docker-recommandé)
   - [4.2 Manuellement (dev)](#42-manuellement-développement)
5. [Configuration (variables d'environnement)](#5-configuration-variables-denvironnement)
6. [Guide d'utilisation de l'application](#6-guide-dutilisation-de-lapplication)
7. [Référence de l'API REST](#7-référence-de-lapi-rest)
8. [Pipeline DevSecOps (CI/CD)](#8-pipeline-devsecops-cicd)
9. [Dépannage (obstacles courants)](#9-dépannage-obstacles-courants)

---

## 1. Présentation

StockIQ permet de piloter un inventaire de bout en bout :

| Module | Description |
|---|---|
| 📦 **Produits** | Catalogue avec référence unique, catégorie, quantité et seuil minimum. |
| 🔄 **Mouvements** | Enregistrement des **entrées**, **sorties** et **transferts**, avec contrôle de stock. |
| 🔔 **Alertes** | Liste automatique des produits sous leur seuil minimum. |
| 📊 **Tableau de bord** | Statistiques et graphiques (Recharts). |
| 🧾 **Rapports** | Mouvements filtrés entre deux dates. |
| 👥 **Administrateurs** | Gestion des comptes (CRUD + changement de mot de passe). |
| 🔒 **Sécurité** | Authentification JWT stateless, mots de passe chiffrés BCrypt. |

## 2. Architecture

```
┌────────────┐      /api (proxy)      ┌──────────────┐      JDBC       ┌─────────┐
│  Frontend  │ ─────────────────────► │   Backend    │ ──────────────► │  MySQL  │
│ React+nginx│ ◄───────────────────── │ Spring Boot  │ ◄────────────── │   8.0   │
│  (port 80) │        JSON+JWT        │ (port 8080)  │                 └─────────┘
└────────────┘                        └──────────────┘
```

- **Backend** (`demo/`) : architecture en couches `entity → repository → service → controller`, plus `dto`, `security` (JWT), `config`, `exception`.
- **Frontend** (`frontend/`) : React 19 + Vite + Axios (JWT injecté automatiquement) + Recharts.
- En Docker, **nginx sert le frontend ET proxifie `/api`** vers le backend → même origine, donc pas de CORS.

## 3. Prérequis

| Outil | Version | Usage |
|---|---|---|
| **Docker + Docker Compose** | récent | démarrage recommandé |
| **JDK** | **17** (obligatoire) | build/exécution backend hors Docker |
| **Node.js** | 22+ | build/exécution frontend hors Docker |
| **MySQL** | 8.x | base de données (fournie par Docker sinon) |

> ⚠️ **Le backend ne compile qu'avec le JDK 17.** Avec un JDK plus récent (ex. 25) le build échoue.
> Voir [§9](#9-dépannage-obstacles-courants).

## 4. Installation & démarrage

### 4.1 Avec Docker (recommandé)

```bash
# 1. Cloner puis se placer à la racine du projet
cd "Gestion de Stock"

# 2. Créer le fichier d'environnement et personnaliser les secrets
cp .env.example .env
#   éditez .env : DB_PASSWORD, JWT_SECRET, DEFAULT_ADMIN_PASSWORD

# 3. Lancer toute la stack
docker compose up --build
```

Accès :
- **Application** : http://localhost
- **Connexion** : `admin` / la valeur de `DEFAULT_ADMIN_PASSWORD`

Arrêt / nettoyage :
```bash
docker compose down       # arrête les conteneurs
docker compose down -v     # + supprime le volume MySQL (remet à zéro les données)
```

### 4.2 Manuellement (développement)

**a) Base de données** — créez une base vide (les tables sont générées automatiquement par Hibernate `ddl-auto=update`) :
```sql
CREATE DATABASE gestion_stock CHARACTER SET utf8mb4;
```

**b) Backend** :
```bash
cd demo

# ⚠️ Sans ces variables, aucun compte n'existe → connexion impossible !
export DEFAULT_ADMIN_ENABLED=true
export DEFAULT_ADMIN_PASSWORD=admin123
# Adaptez si votre MySQL n'est pas sur le port MAMP 8889 :
export DB_URL="jdbc:mysql://localhost:3306/gestion_stock?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export DB_USERNAME=root
export DB_PASSWORD=root
export JWT_SECRET=DevSecretKey_ChangeMe_At_Least_32_Chars

# Démarrage avec le JDK 17
JAVA_HOME=$(/usr/libexec/java_home -v 17) ./mvnw spring-boot:run
```
Backend : http://localhost:8080 — Swagger : http://localhost:8080/swagger-ui.html

**c) Frontend** :
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```
Le frontend appelle par défaut `http://localhost:8080/api` (autorisé par la config CORS pour `localhost:5173`).

## 5. Configuration (variables d'environnement)

Toutes les valeurs sensibles sont externalisées (aucun secret en dur dans le code).

| Variable | Défaut | Rôle |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:8889/gestion_stock…` | URL JDBC MySQL (8889 = MAMP) |
| `DB_USERNAME` | `root` | utilisateur MySQL |
| `DB_PASSWORD` | `root` | mot de passe MySQL |
| `JWT_SECRET` | clé de dev | secret JWT (**≥ 32 caractères**) |
| `JWT_EXPIRATION` | `86400000` | durée de vie du token (ms, 24 h) |
| `DEFAULT_ADMIN_ENABLED` | `false` | crée un admin au 1er démarrage |
| `DEFAULT_ADMIN_LOGIN` | `admin` | login de l'admin initial |
| `DEFAULT_ADMIN_PASSWORD` | *(vide)* | mot de passe de l'admin initial (**requis** si activé) |
| `DEFAULT_ADMIN_ROLE` | `RESPONSABLE` | rôle de l'admin initial |
| `SERVER_PORT` | `8080` | port du backend |

Fichiers de référence : `demo/src/main/resources/application.properties` (défauts dev),
`demo/src/main/resources/application.example.properties` (modèle prod), `.env.example` (Docker),
`frontend/.env.example` (`VITE_API_BASE_URL`).

## 6. Guide d'utilisation de l'application

1. **Page d'accueil** — présentation de StockIQ ; bouton **Se connecter**.
2. **Connexion** — saisissez login / mot de passe. Un token JWT est stocké et injecté
   automatiquement dans les requêtes suivantes.
3. **Tableau de bord** — indicateurs clés (nombre de produits, valeur du stock, alertes) et graphiques.
4. **Produits** — lister, ajouter, modifier, supprimer. Chaque produit a une **référence unique**,
   une catégorie, une quantité et un **seuil minimum**.
5. **Mouvements** — enregistrer une **entrée** (augmente le stock), une **sortie** (diminue,
   refusée si stock insuffisant) ou un **transfert**. Chaque mouvement est horodaté et rattaché à l'utilisateur.
6. **Alertes** — affiche les produits dont la quantité est **≤ seuil minimum**.
7. **Rapports** — sélectionnez deux dates pour obtenir les mouvements de la période.
8. **Admins** — gérez les comptes responsables (création, modification, mot de passe, suppression).
9. **Profil** — consultez vos informations et changez votre mot de passe.
10. **Déconnexion** — vide le token et renvoie à l'accueil.

## 7. Référence de l'API REST

Base : `http://localhost:8080`. Toutes les routes hors `/api/auth/**` exigent l'en-tête
`Authorization: Bearer <token>`. Documentation interactive : **`/swagger-ui.html`**.

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion → renvoie un token JWT |
| GET | `/api/produits` | Liste des produits |
| GET | `/api/produits/{id}` | Détail d'un produit |
| POST | `/api/produits` | Créer un produit |
| PUT | `/api/produits/{id}` | Modifier un produit |
| DELETE | `/api/produits/{id}` | Supprimer un produit |
| GET | `/api/mouvements` | Liste des mouvements |
| POST | `/api/mouvements` | Enregistrer entrée / sortie / transfert |
| GET | `/api/alertes` | Produits sous le seuil minimum |
| GET | `/api/dashboard` | Statistiques du tableau de bord |
| GET | `/api/rapports?debut=YYYY-MM-DD&fin=YYYY-MM-DD` | Mouvements entre deux dates |
| GET | `/api/admin/utilisateurs` | Liste des administrateurs |
| GET | `/api/admin/utilisateurs/{id}` | Détail d'un administrateur |
| GET | `/api/admin/moi` | Profil de l'utilisateur connecté |
| POST | `/api/admin/utilisateurs` | Créer un administrateur |
| PUT | `/api/admin/utilisateurs/{id}` | Modifier un administrateur |
| PUT | `/api/admin/utilisateurs/{id}/password` | Changer le mot de passe |
| DELETE | `/api/admin/utilisateurs/{id}` | Supprimer un administrateur |
| GET | `/actuator/health` | État de santé (pour healthcheck / monitoring) |

Exemple de connexion :
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","motDePasse":"admin123"}'
# → { "token": "...", "login": "admin", "role": "RESPONSABLE" }
```

## 8. Pipeline DevSecOps (CI/CD)

Le pipeline GitLab (`.gitlab-ci.yml`) est organisé en 6 étapes :

| Étape | Job | Outil | Bloquant |
|---|---|---|---|
| validate | `frontend-lint-build` | ESLint + Vite | ✅ |
| test | `backend-tests` | JUnit / Maven | ✅ |
| **sast** | `sonarqube-check` | **SonarQube** | ✅ (si configuré) |
| build | `build-images` | Docker → Container Registry | ✅ |
| **sca** | `trivy-fs-scan`, `trivy-image-scan` | **Trivy** | ✅ (HIGH/CRITICAL corrigeables) |
| **dast** | `zap-baseline-scan` | **OWASP ZAP** | ⚠️ non (rapport seul) |

### Mise en place de SonarQube (self-hosted)

```bash
# 1. Lancer SonarQube en local
docker run -d --name sonarqube -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  sonarqube:community
# 2. http://localhost:9000 (admin/admin), créer le projet « gestion-stock », générer un token
```

Puis dans **GitLab → Settings → CI/CD → Variables**, ajoutez :

| Variable | Valeur |
|---|---|
| `SONAR_URL` | `http://host.docker.internal:9000` |
| `SONAR_TOKEN` | *(token, masqué)* |
| `SONAR_PROJECT_KEY` | `gestion-stock` |

> Un **GitLab Runner local** (executor Docker, **`privileged = true`**) est requis pour joindre
> SonarQube et exécuter les jobs Docker-in-Docker (build d'images, ZAP).

### Tester les scans en local

```bash
# SCA — Trivy sur le code (offline pour éviter le rate-limit Maven)
docker run --rm -v "$PWD:/src" -v "$HOME/.m2:/root/.m2" \
  aquasec/trivy fs --offline-scan --severity HIGH,CRITICAL /src

# DAST — ZAP baseline sur l'app lancée
docker compose up -d --build
docker run --rm --network host -v "$PWD:/zap/wrk" \
  zaproxy/zap-stable zap-baseline.py -t http://localhost -r zap-report.html
docker compose down -v
```

Les rapports Trivy et ZAP sont exportés en **artifacts** de chaque pipeline (téléchargeables).

## 9. Dépannage (obstacles courants)

| Symptôme | Cause | Solution |
|---|---|---|
| **Impossible de se connecter** (« Bad credentials ») sur une install fraîche | Aucun compte : l'admin par défaut est désactivé | Activer `DEFAULT_ADMIN_ENABLED=true` + `DEFAULT_ADMIN_PASSWORD=…` (ou utiliser Docker qui le fait). |
| Le build backend échoue (erreurs de compilation Java) | Mauvais JDK (25 par défaut) | Utiliser le **JDK 17** : `JAVA_HOME=$(/usr/libexec/java_home -v 17) ./mvnw …` |
| `Communications link failure` / connexion MySQL refusée | Mauvais port/host BDD (défaut = MAMP 8889) | Définir `DB_URL` vers votre MySQL (souvent `:3306`). |
| Build Docker : `429 Too Many Requests` (Maven Central) | Trop de requêtes vers le dépôt Maven | Attendre ~30 min, ou monter le cache local `~/.m2` et utiliser `--offline-scan` pour Trivy. |
| Jobs CI `build-images` / `zap-baseline-scan` échouent sur Docker | Runner non privilégié | `privileged = true` dans `~/.gitlab-runner/config.toml`, puis redémarrer le runner. |
| Job `sonarqube-check` est **sauté** | Variables `SONAR_*` absentes | Les définir dans GitLab (voir §8). Comportement normal sinon. |
| Erreurs CORS dans le navigateur (dev) | Frontend sur un port non autorisé | Lancer Vite sur `5173` (défaut) ou ajouter l'origine dans `SecurityConfig`. |
| Le port 80 est déjà utilisé (Docker) | Conflit de port hôte | Modifier le mapping du service `frontend` dans `docker-compose.yml` (ex. `8081:8080`). |
