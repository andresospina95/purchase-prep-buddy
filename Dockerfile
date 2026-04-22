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
COPY --from=builder /app/server.js ./server.js

EXPOSE 3000

# Azure inicia un servidor Node estándar que envuelve el handler generado.
CMD ["node", "server.js"]
