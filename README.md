# File Upload + Image Processing API

Backend API service for uploading, validating, storing, transforming, listing, retrieving, and deleting image assets.

## Project Highlights
- Modular monolith architecture (Express + TypeScript + TypeORM).
- Single-image upload with MIME/extension/size validation.
- Cloudinary integration for storage and transformation URLs.
- PostgreSQL metadata persistence.
- REST endpoints for upload lifecycle (`create`, `list`, `get`, `delete`).
- Standardized success/error response envelopes.
- Swagger/OpenAPI docs at `/api-docs`.
- Jest + Supertest unit and integration tests.

## Tech Stack
- Node.js, Express, TypeScript
- TypeORM, PostgreSQL
- Multer, Cloudinary
- Jest, Supertest
- Swagger/OpenAPI
- dotenv, ESLint, Prettier

## API Endpoints (MVP)
- `POST /api/v1/uploads`
- `GET /api/v1/uploads`
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
MVP includes single-image upload lifecycle and transformation URL generation. Post-MVP includes multi-upload, auth/RBAC, soft delete, rate limiting, variants, and advanced filtering.
