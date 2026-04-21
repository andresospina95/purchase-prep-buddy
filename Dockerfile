# --- Stage 1: build ---
FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# --- Stage 2: runtime ---
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Necesitamos node_modules (incluye wrangler/miniflare) y el build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/wrangler.jsonc ./wrangler.jsonc

EXPOSE 3000
# wrangler dev usa miniflare (Workers runtime sobre Node) y sirve el build.
# --var inyecta DATABASE_URL al Worker en runtime desde la env del contenedor.
CMD ["sh", "-c", "npx wrangler dev --config dist/server/wrangler.json --ip 0.0.0.0 --port 3000 --var DATABASE_URL:\"$DATABASE_URL\""]
