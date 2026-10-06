# Etapa 1: Base
FROM node:22-alpine AS base

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

EXPOSE 5173

CMD ["pnpm", "exec", "vite", "--host"]
