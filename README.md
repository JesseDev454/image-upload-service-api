# File Upload + Image Processing API

![CI](https://github.com/JesseDev454/image-upload-service-api/actions/workflows/ci.yml/badge.svg)

Backend API service for uploading, validating, storing, transforming, listing, retrieving, and deleting image assets.

## Project Highlights
- Modular monolith architecture (Express + TypeScript + TypeORM).
- Single-image upload with MIME/extension/size validation.
- Cloudinary integration for storage and transformation URLs.
- PostgreSQL metadata persistence.
- Paginated and filterable upload listing with `page`, `limit`, `format`, `mimeType`, `ownerType`, and `ownerId`.
- Optional resource association via `ownerType` + `ownerId` for avatars, products, banners, and other business entities.
- Contract-driven media storage boundary so the upload module depends on a storage interface rather than Cloudinary-specific types.
- REST endpoints for upload lifecycle (`create`, `list`, `get`, `delete`).
- Standardized success/error response envelopes.
- Swagger/OpenAPI docs at `/api-docs`.
- Jest + Supertest unit and integration tests.
- GitHub Actions CI that runs lint, test, and build on pushes and pull requests.

## Tech Stack
- Node.js, Express, TypeScript
- TypeORM, PostgreSQL
- Multer, Cloudinary
- Jest, Supertest
- Swagger/OpenAPI
- dotenv, ESLint, Prettier

## API Endpoints (MVP)
- `POST /api/v1/uploads`
- `GET /api/v1/uploads?page=1&limit=20&format=png&mimeType=image/png&ownerType=user&ownerId=user-123`
- `GET /api/v1/uploads/:id`
- `DELETE /api/v1/uploads/:id`

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template:
   ```bash
   copy .env.example .env
   ```
3. Configure PostgreSQL and Cloudinary credentials in `.env`.
4. Run development server:
   ```bash
   npm run dev
   ```
5. Open Swagger docs:
   - `http://localhost:4000/api-docs`

## Test Commands
```bash
npm test
```

## CI Validation
- GitHub Actions runs `npm run lint`, `npm test`, and `npm run build`.
- The test suite uses in-memory repository/provider fakes, so CI does not need real Cloudinary or PostgreSQL credentials.

## Docs
- `docs/project-overview.md`
- `docs/user-stories.md`
- `docs/requirements.md`
- `docs/architecture.md`
- `docs/database-design.md`
- `docs/api-design.md`
- `docs/security-validation.md`
- `docs/testing-strategy.md`
- `docs/folder-structure.md`
- `docs/sprint-plan.md`
- `docs/decision-log.md`

## Scope
Current scope includes single-image upload lifecycle, optional resource association, paginated/filterable listing, and transformation URL generation. Post-MVP includes multi-upload, auth/RBAC, soft delete, rate limiting, and named variants.
