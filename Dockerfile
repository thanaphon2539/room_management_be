FROM node:20-alpine

WORKDIR /app

# ติดตั้ง Chromium + dependencies ที่ Puppeteer ต้องใช้
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# ให้ puppeteer-core ใช้ chromium ที่ติดตั้งไว้
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
RUN npm install -g pnpm && pnpm install
COPY . .

EXPOSE 3005
CMD ["pnpm", "run", "start:dev"]
