# Multi-stage build for Client
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json vite.config.ts index.html ./
RUN npm ci --legacy-peer-deps

COPY src ./src
COPY public ./public
RUN npm run build

# Nginx production stage
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Custom Nginx config to support React Router single-page app redirection
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
