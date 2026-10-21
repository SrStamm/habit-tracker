# Etapa 1: build de producción (tsc + vite build)
FROM node:22-alpine AS build

RUN npm install -g pnpm@11.22.0

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY back/package.json ./back/
COPY shared/package.json ./shared/
COPY front/package.json ./front/

RUN pnpm install --frozen-lockfile

COPY front/ ./front/
COPY shared/ ./shared/

WORKDIR /app/front

RUN pnpm build

# Etapa 2: nginx sirviendo dist/ — sin Node ni dev server en runtime
FROM nginx:alpine

COPY front/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/front/dist /usr/share/nginx/html

# 5173 y no 80: mantiene el contrato con el cloudflared tunnel sin cambios
EXPOSE 5173
