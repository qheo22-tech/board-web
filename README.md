# Seowolseong Board (Spring Boot + React)

비밀번호 기반의 간단 게시판 서비스입니다.  
게시글 CRUD와 파일 업로드/다운로드를 제공하며, 프론트엔드와 백엔드를 분리해 구현했습니다.

추가로 **Spring Security 기반 세션 로그인/로그아웃**을 적용해,
서버 측 인증 흐름과 세션 관리 구조를 구성했습니다.

---

## Features

### Post
- 게시글 목록 조회
- 게시글 상세 조회
- 게시글 작성
- 게시글 수정 (비밀번호 검증)
- 게시글 삭제 (비밀번호 검증)

### File
- 게시글별 다중 파일 업로드 (multipart/form-data)
- 파일 다운로드
- 파일 삭제 (비밀번호 검증)

### Auth / Session
- Spring Security 기반 로그인
- 로그인 시 HTTP Session 생성
- 로그아웃 시 세션 무효화(invalidate)
- 로그인 상태 확인 API 제공  
  *(현재는 세션 생성/해제 및 상태 확인까지만 구현)*

### Health / Utility
- 서버 응답 확인용 Ping API
  - `GET /api/posts/ping`
- 날짜 표시 포맷 통일 (프론트에서 처리)
  - `YYYY-MM-DD HH:mm:ss`
- 프론트 공통 HTTP 유틸로 네트워크/HTTP 에러 처리 통일
  - `apiGet / apiJson / apiForm` + `ApiError`

---

## Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security (Session 기반 인증)
- Spring Data JPA
- AWS SDK (S3 업로드/다운로드)
- JPA 지원 DB (예: MySQL)

### Frontend
- React
- React Router
- dayjs (날짜 포맷)
- Fetch 기반 공통 API 유틸

---

## API (요약)

### Auth
- `POST /api/auth/login` : 로그인 (Spring Security 인증, 세션 생성)
- `POST /api/auth/logout` : 로그아웃 (세션 무효화)
- `GET /api/auth/me` : 로그인 상태 확인

### Post
- `GET /api/posts` : 게시글 목록 조회
- `GET /api/posts/{id}` : 게시글 상세 조회
- `POST /api/posts` : 게시글 생성
- `POST /api/posts/{id}/verify-password` : 비밀번호 검증
- `POST /api/posts/{id}/update` : 게시글 수정
- `POST /api/posts/{id}/delete` : 게시글 삭제
- `GET /api/posts/ping` : 서버 Ping (응답 확인)

### File
- `POST /api/files/upload` : 파일 업로드  
  (multipart/form-data, `postId`, `files`)
- `GET /api/files/{fileId}/download` : 파일 다운로드
- `POST /api/files/{fileId}/delete` : 파일 삭제

---

## Authentication / Session (Current Status)

- Spring Security를 사용해 로그인 인증을 처리합니다.
- 인증 성공 시 HTTP Session이 생성됩니다.
- 로그아웃 시 세션을 invalidate 처리합니다.
- 현재는 **로그인/로그아웃 및 로그인 상태 확인까지만 구현**되어 있으며,
  게시글/파일 API에 대한 접근 제어는 아직 적용하지 않았습니다.

---

## Frontend Error Handling

모든 HTTP 요청은 공통 API 유틸을 통해 처리합니다.

- 네트워크 오류(fetch 실패)
  - `ApiError(code=NETWORK_ERROR, status=0)`
- HTTP 오류(4xx / 5xx)
  - 서버 ErrorResponse(JSON) 또는 text를 `ApiError`로 변환
- 화면 단에서는 `try/catch`로 메시지 처리 (alert / UI 표시)

---

## Date Formatting

백엔드는 ISO-8601 형식으로 날짜를 반환합니다.

예시: 프론트엔드에서 dayjs를 사용해 다음 형식으로 변환합니다.

- `YYYY-MM-DD HH:mm:ss`  
  (T, ms, Z 제거)

---

## Run (Local)

### Backend

> **Gradle 기반 Spring Boot 프로젝트**

```bash
./mvnw spring-boot:run
