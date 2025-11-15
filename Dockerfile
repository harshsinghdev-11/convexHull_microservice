FROM node:22-slim

RUN apt-get update && apt-get install -y libvips && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000 

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node","--max-old-space-size=2048","index.js"]