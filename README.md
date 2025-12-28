# Seowolseong Board (Spring Boot + React)

비밀번호 기반의 간단 게시판 서비스입니다.  
게시글 CRUD와 파일 업로드/다운로드를 제공하며, 프론트/백엔드를 분리해 구현했습니다.

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

### Health / Utility
- 개발/운영 중 서버 응답 확인용 Ping API
  - `GET /api/posts/ping`
- 날짜 표시 포맷 통일 (프론트에서 처리)
  - `YYYY-MM-DD HH:mm:ss`
- 프론트 공통 HTTP 유틸로 네트워크/HTTP 에러 처리 통일
  - `apiGet / apiJson / apiForm` + `ApiError`

---

## Tech Stack

### Backend
- Java / Spring Boot
- Spring Data JPA
- AWS SDK (S3 업로드/다운로드)
- (DB) JPA 지원 DB (예: MySQL)

### Frontend
- React
- React Router
- dayjs (날짜 포맷)
- Fetch 기반 공통 API 유틸

---

## API (요약)

### Post
- `GET /api/posts` : 목록
- `GET /api/posts/{id}` : 상세
- `POST /api/posts` : 생성
- `POST /api/posts/{id}/verify-password` : 비밀번호 검증
- `POST /api/posts/{id}/update` : 수정
- `POST /api/posts/{id}/delete` : 삭제
- `GET /api/posts/ping` : Ping (응답 확인용)

### File
- `POST /api/files/upload` : 업로드 (multipart, `postId`, `files`)
- `GET /api/files/{fileId}/download` : 다운로드
- `POST /api/files/{fileId}/delete` : 삭제

---

## Frontend Error Handling

모든 HTTP 요청은 공통 유틸을 통해 호출합니다.

- 네트워크 실패(fetch 자체 실패) → `ApiError(code=NETWORK_ERROR, status=0)`
- HTTP 실패(4xx/5xx) → 서버 ErrorResponse(JSON) 또는 text를 `ApiError`로 변환
- 화면에서는 try/catch로 메시지 처리(표시/alert 등)

---

## Date Formatting

백엔드는 ISO-8601 형태(예: `2025-12-27T17:04:15.121227Z`)로 내려주고,  
프론트에서 dayjs로 화면 표시 포맷을 통일했습니다.

- `YYYY-MM-DD HH:mm:ss` (T, ms, Z 제거)

---

## Run (Local)

### Backend
```bash
./gradlew bootRun
