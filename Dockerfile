# 1️build stage (Node에서 Vite 빌드)
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
# 여기서 /app/dist 생성됨

# 2️ run stage (Nginx로 정적 서빙)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
