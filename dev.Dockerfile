FROM node:21.0.0-alpine3.17

WORKDIR /app

RUN corepack enable
RUN pnpm config set store-dir /pnpm-store

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

CMD ["sh", "./docker-entry-point.sh"]
