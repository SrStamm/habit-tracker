FROM node:22-slim

RUN npm install -g pnpm@11.22.0

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY back/package.json ./back/
COPY shared/package.json ./shared/
COPY front/package.json ./front/

RUN pnpm install --frozen-lockfile

COPY back/ ./back/
COPY shared/ ./shared/

WORKDIR /app/back

EXPOSE 3000

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
