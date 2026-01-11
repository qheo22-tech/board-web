# 1단계: 빌드 stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2단계: 실행 stage
FROM nginx:alpine

# [필수] 기존 파일 및 설정 싹 비우기 (Welcome 페이지 유령 박멸)
RUN rm -rf /usr/share/nginx/html/*
RUN rm -f /etc/nginx/conf.d/default.conf

# [필수] 빌드 결과물 복사
COPY --from=build /app/dist /usr/share/nginx/html

# [핵심] 별도의 파일 없이 Dockerfile에서 바로 Nginx 설정 주입
# MIME 타입 에러 방지 + SPA 라우팅 지원
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    include /etc/nginx/mime.types; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]