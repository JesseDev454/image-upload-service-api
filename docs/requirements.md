# Requirements

## Functional Requirements
- **FR-001** The system shall expose `POST /api/v1/uploads` for single image upload.
- **FR-002** The API shall accept `multipart/form-data` with required `image` file field.
- **FR-003** The service shall validate allowed MIME types (`image/jpeg`, `image/png`, `image/webp`).
- **FR-004** The service shall validate file extensions (`.jpg`, `.jpeg`, `.png`, `.webp`).
- **FR-005** The service shall reject files above configured max size (default `5MB`).
- **FR-006** The system shall reject upload requests without file payload.
- **FR-007** The service shall upload accepted files to Cloudinary.
- **FR-008** The service shall persist upload metadata in PostgreSQL after provider upload.
- **FR-009** The system shall expose `GET /api/v1/uploads/:id`.
- **FR-010** The system shall expose `GET /api/v1/uploads`.
- **FR-011** Listing shall return newest-first records (`createdAt DESC`) with bounded size.
- **FR-012** The system shall expose `DELETE /api/v1/uploads/:id`.
- **FR-013** Delete shall remove asset from Cloudinary and metadata from DB.
- **FR-014** The API shall return consistent success/error envelopes across endpoints.
- **FR-015** The API shall normalize errors (`VALIDATION_ERROR`, `NOT_FOUND`, `PROVIDER_ERROR`, `INTERNAL_ERROR`).
- **FR-016** Retrieve endpoint shall support transformation URL generation from query params.
- **FR-017** The service shall support optional metadata (`folder`, `ownerType`, `ownerId`, `uploadedBy`).
- **FR-018** The service shall expose Swagger/OpenAPI documentation.

### Post-MVP Functional Requirements
- **FR-019** Multiple image upload endpoint.
- **FR-020** Soft delete and restore support.
- **FR-021** Image replacement endpoint.
- **FR-022** Advanced pagination and filtering.
- **FR-023** Dedicated transformed URL endpoint.
- **FR-024** Optional persisted image variants.

## Non-Functional Requirements
- **NFR-001 Maintainability:** Modular layered structure per feature.
- **NFR-002 Readability:** TypeScript strict typing and clean naming.
- **NFR-003 Modularity:** Cloudinary integration isolated in provider layer.
- **NFR-004 Testability:** Services testable without Express runtime.
- **NFR-005 API Consistency:** Stable response envelope and error code taxonomy.
- **NFR-006 Security:** Validation must run before provider/DB operations.
- **NFR-007 Reliability:** Failures must never return false-success responses.
- **NFR-008 Performance:** Single upload should complete in practical dev latency.
- **NFR-009 Scalability:** Support moderate usage and future pagination/rate limiting.
- **NFR-010 Config Management:** Env-driven config with startup validation.
- **NFR-011 Logging:** Request-scoped error logging without leaking sensitive values.
- **NFR-012 Documentation:** Complete docs for architecture, API, and test strategy.

## Assumptions
- Cloudinary credentials are available for local runtime.
- PostgreSQL is available locally.
- API handles images only.
- MVP consumers are trusted/internal (no auth yet).
- Portfolio scope does not require deployment.

## Constraints
- Single service architecture (no microservices).
- No frontend implementation.
- No background jobs/queues in MVP.
- No chunked/resumable upload in MVP.
- Required stack: Node.js, Express, TypeScript, TypeORM, PostgreSQL, Cloudinary, Multer, Jest, Supertest.

## Dependencies
- Cloudinary SDK
- PostgreSQL
- TypeORM
- Multer
- Jest + Supertest
- dotenv
- Swagger/OpenAPI tooling
- ESLint + Prettier
