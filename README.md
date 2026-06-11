# little-tiktok

Mini TikTok course project repository.

## Stack

- Backend: Spring Boot 3, Spring Security, MyBatis, JWT, Actuator, Prometheus
- Frontend: Next.js
- Database: MySQL
- Object storage: MinIO

## Backend startup

Requirements:

- JDK 17 or 21
- Maven 3.9+
- MySQL 8.x
- MinIO

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

If you use IntelliJ IDEA:

- Open the project root `little-tiktok`, then reload Maven after the root `pom.xml` is detected.
- If IDEA shows a Lombok warning, click `Enable annotation processing`.
- Prefer the Maven command `backend -> spring-boot:run` or run `MiniTikTokApplication` after Maven reload finishes.

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

## MinIO storage

Member D module stores uploaded media in MinIO by default.

- Backend storage switch: `backend/src/main/resources/application.yml`
- Current API endpoint: `http://127.0.0.1:9005`
- Current bucket: `ltt`
- Public object base URL: `http://127.0.0.1:9005/ltt`

Team setup rule:

- Each team member should install and run a local MinIO instance before testing upload / object storage.
- Please follow the first four sections of this tutorial:
- https://blog.csdn.net/m0_58769790/article/details/144744609

Recommended execution summary for our project on Windows:

1. Create a local MinIO working directory such as `D:\Minio`
2. Under it, prepare folders like `bin`, `data`, and `logs`
3. Download the Windows MinIO binaries mentioned in the tutorial and place them in `D:\Minio\bin`
4. Start MinIO with the command below from the `bin` directory

Example MinIO startup command used by this project:

```powershell
setx MINIO_ROOT_USER minioadmin
setx MINIO_ROOT_PASSWORD minioadmin
.\minio.exe server D:\develpo\minio\data --console-address "127.0.0.1:9000" --address "127.0.0.1:9005"
```

Notes:

- `9005` is the S3 API port used by the backend.
- `9000` is only the MinIO WebUI port.
- Upload and delete now operate on MinIO objects.
- Local storage remains available as a fallback mode only when `app.storage.type=local`.
- After startup, open `http://127.0.0.1:9000` to log into MinIO WebUI.
- The backend must connect to `http://127.0.0.1:9005`, not `9000`.

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
4. Upload a video file on `/upload` and verify the object appears in MinIO bucket `ltt`
5. Open returned `videoUrl` to prove MinIO object access works
6. Visit `/my-videos` and show paginated list
7. Show that `/api/v1/videos/{videoId}` only allows the owner or admin to read the detail
8. Delete your own video and verify the object is removed from MinIO
9. Use another token in Apifox to show `403` on deleting someone else's video

## Apifox

Apifox-ready notes for the video management module:

- `docs/member-b-my-videos-apifox.md`

## Remaining notes

- Logging, request input/output, request cost time, JWT auth, and OpenAPI were reused from the existing backend foundation.
- Recommendation / like / feed modules still contain unfinished or placeholder parts outside Member D scope.
