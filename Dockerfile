# --- Stage 1: build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependencias
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copia el código y construye
COPY . .
RUN npm run build

# --- Stage 2: runtime (nginx estático) ---
FROM nginx:1.27-alpine AS runner

# Config de nginx con fallback SPA
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copia el build (ajusta si tu salida es distinta)
# TanStack Start con SSR genera /app/.output, pero esta app no usa SSR:
# usamos el build estático de Vite en /app/dist si existe; si no, el client de .output.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
