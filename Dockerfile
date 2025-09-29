FROM node:20-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3005

CMD ["pnpm", "run", "start:dev"]
