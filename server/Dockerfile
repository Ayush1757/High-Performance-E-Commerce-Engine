# Multi-stage build for Server
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/index.js"]
