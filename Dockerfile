FROM node:20-alpine

WORKDIR /app

# ติดตั้ง dependency ที่ Puppeteer/Chromium ต้องใช้
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# ให้ puppeteer รู้ path ของ chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./

RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 3005

CMD ["pnpm", "run", "start:dev"]
