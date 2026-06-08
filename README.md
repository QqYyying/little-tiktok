# little-tiktok

Mini TikTok course project repository.

## Stack

- Backend: Spring Boot 3, Spring Security, MyBatis, JWT, Actuator, Prometheus
- Frontend: Next.js
- Database: MySQL

## Backend startup

Requirements:

- JDK 17 or 21
- Maven 3.9+
- MySQL 8.x

Important:

- The backend `pom.xml` targets Java 17.
- If your machine default `java -version` is still Java 8, switch `JAVA_HOME` before starting.

Example on Windows PowerShell:

```powershell
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
$env:Path='C:\Program Files\Java\jdk-21\bin;' + $env:Path
java -version
```

Start backend:

```powershell
cd backend
mvn spring-boot:run
```

Backend default address:

- `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

## Database

Default backend datasource is configured in:

- `backend/src/main/resources/application-dev.yml`

Before backend startup, make sure your MySQL schema already exists, then execute SQL in this order as needed:

1. Base tables: `sql/table_v1.sql`
2. Seed data: `sql/initial_v1.sql`
3. Member B incremental patch: `sql/member_b_video_module.sql`

Recommended manual checks before running the patch:

- `user` table should contain `id`, `username`, `password_hash`, `status`
- `video` table should contain `id`, `author_id`, `title`, `play_url`, `cover_url`, `like_count`, `status`
- If `role`, `updated_at`, `description`, `deleted_at` or extended `request_log` columns are missing, apply the incremental patch

## Local file upload

Member B module uses local storage instead of object storage.

- Video files are stored under `backend/uploads/videos/`
- Cover files are stored under `backend/uploads/covers/`
- Public access path is `/uploads/**`

Example:

- `backend/uploads/videos/demo.mp4`
- `http://localhost:8080/uploads/videos/demo.mp4`

Upload limits are configured in:

- `backend/src/main/resources/application.yml`

Current limits:

- Max single file size: `100MB`
- Max multipart request size: `120MB`

## Frontend startup

Requirements:

- Node.js 18+
- pnpm

Start frontend:

```powershell
cd frontend
pnpm install
pnpm dev
```

If needed, configure:

```powershell
$env:NEXT_PUBLIC_API_URL='http://localhost:8080/api/v1'
```

Frontend default pages:

- Home: `http://localhost:3000`
- Login/Register: `http://localhost:3000/login`
- Upload: `http://localhost:3000/upload`
- My videos: `http://localhost:3000/my-videos`

## Demo flow

Recommended defense demo order:

1. Open Swagger and show existing auth / log / monitoring foundation
2. Register a new user on `/login`
3. Log in and obtain JWT-based session
4. Upload a local video file on `/upload`
5. Open returned `videoUrl` to prove local file access works
6. Visit `/my-videos` and show paginated list
7. Delete your own video
8. Use another token in Apifox to show `403` on deleting someone else's video

## Apifox

Apifox-ready notes for Member B module:

- `docs/member-b-my-videos-apifox.md`

## Remaining notes

- Logging, request input/output, request cost time, JWT auth, and OpenAPI were reused from the existing backend foundation.
- Recommendation / like / feed modules still contain unfinished or placeholder parts outside Member B scope.
