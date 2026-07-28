# ──────────────────────────────────────────────────────────────
#  Étape 1 : build (Node + Vite)
# ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# En conteneur, le frontend appelle /api (même origine) ; nginx proxifie vers le backend.
ENV VITE_API_BASE_URL=/api
RUN npm run build

# ──────────────────────────────────────────────────────────────
#  Étape 2 : runtime (nginx non-root, écoute sur 8080)
# ──────────────────────────────────────────────────────────────
FROM nginxinc/nginx-unprivileged:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
