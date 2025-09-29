FROM node:20-alpine

WORKDIR /app

# copy เฉพาะ package.json
COPY package*.json ./

RUN npm install -g pnpm && pnpm install

# copy source code ทั้งหมด
COPY . .

EXPOSE 3005

CMD ["pnpm", "run", "start:dev"]
