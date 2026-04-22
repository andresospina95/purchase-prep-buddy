# --- Stage 1: build ---
FROM --platform=linux/amd64 node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# --- Stage 2: runtime ---
# Node puro, sin wrangler/workerd. Compatible con Azure Container Apps,
# Azure App Service for Containers, Azure Container Instances y cualquier VM.
FROM --platform=linux/amd64 node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Solo lo necesario para correr en producción.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# El preset `node-server` de TanStack Start emite un server Node estándar.
# Lee DATABASE_URL directamente de process.env (la inyecta Azure).
CMD ["node", "dist/server/index.mjs"]
