# --- Stage 1: build ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
# Usamos `npm install` (no `ci`) porque el lockfile puede estar
# desactualizado respecto a package.json. Esto lo regenera dentro
# del contenedor sin bloquear el build.
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# --- Stage 2: runtime ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copia el output del build de TanStack Start.
# Incluye assets cliente y server bundle.
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
# El entry server emitido por TanStack Start
CMD ["node", ".output/server/index.mjs"]
