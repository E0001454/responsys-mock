# as-ms-ar-abc-frontend

Frontend SPA del sistema de gestión Responsys. Construido con Vue 3, TypeScript y Vite. Se autentica mediante Okta y consume múltiples microservicios configurables por entorno.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Vue 3 + `<script setup>` |
| Lenguaje | TypeScript 5 |
| Bundler | Vite 7 |
| Estilos | Tailwind CSS 4 |
| Autenticación | Okta (`@okta/okta-vue`) |
| Router | Vue Router 4 |

## Desarrollo local

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Instalar dependencias
npm install

# 3. Levantar servidor de desarrollo
npm run dev

# 4. (Opcional) Levantar mock server
npm run mock:server
```

## Variables de entorno

Cada microservicio expone tres variables: `_REAL`, `_MOCK` y `_USE_MOCK`.  
Cuando `_USE_MOCK=true` el frontend apunta a `_MOCK`; en caso contrario usa `_URL`.

Ver [.env.example](.env.example) para la lista completa.

---

## Docker

### Requisitos

- Docker Engine 24+

### Generar imagen y exportar como `.tar`

**Linux / CI pipeline**

```bash
chmod +x docker/build-and-export.sh

# Uso: ./docker/build-and-export.sh [VERSION] [ENV_FILE]
./docker/build-and-export.sh 1.0.0 .env
```

**Windows (PowerShell)**

```powershell
# Uso: .\docker\build-and-export.ps1 [-Version <tag>] [-EnvFile <path>]
powershell -ExecutionPolicy Bypass -File .\docker\build-and-export.ps1 -Version 1.0.0 -EnvFile .env.local
```

Ambos scripts generan el archivo `as-ms-ar-abc-frontend-<VERSION>.tar` en la raíz del proyecto.

### Importar en Azure Container Registry (ACR)

```bash
docker load -i as-ms-ar-abc-frontend-1.0.0.tar

docker tag as-ms-ar-abc-frontend:1.0.0 <acr-name>.azurecr.io/as-ms-ar-abc-frontend:1.0.0

az acr login --name <acr-name>
docker push <acr-name>.azurecr.io/as-ms-ar-abc-frontend:1.0.0
```

### Build manual (sin scripts)

```bash
docker build \
  --build-arg VITE_OKTA_ISSUER=https://... \
  --build-arg VITE_OKTA_CLIENT_ID=... \
  --build-arg VITE_OKTA_REDIRECT_URI=https://... \
  -t as-ms-ar-abc-frontend:1.0.0 .

docker save -o as-ms-ar-abc-frontend-1.0.0.tar as-ms-ar-abc-frontend:1.0.0
```

### Correr localmente

```bash
docker run -p 8080:80 as-ms-ar-abc-frontend:1.0.0
# http://localhost:8080
```

### Archivos Docker

| Archivo | Descripción |
|---|---|
| `Dockerfile` | Build multi-etapa: `node:22-alpine` (build) → `nginx:1.27-alpine` (runtime) |
| `nginx.conf` | Servidor estático con SPA fallback, gzip y headers de seguridad |
| `.dockerignore` | Excluye `node_modules`, `dist`, `.env.local`, mock server y archivos de editor |
| `docker/build-and-export.sh` | Script de build + export para Linux/CI |
| `docker/build-and-export.ps1` | Script de build + export para Windows |
