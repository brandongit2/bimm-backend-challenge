FROM node:21.0.0-alpine3.17

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

CMD ["pnpm", "tsx", "watch", "src/server.ts"]
