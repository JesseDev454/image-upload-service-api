# User Stories

## Upload
- **US-001 (Must Have)**  
  As a client app, I want to upload one image file, so that I can store user or product media.
  - **Acceptance Criteria:** Valid `POST /api/v1/uploads` returns `201` with upload `id`, `secureUrl`, and metadata.

- **US-002 (Should Have)**  
  As a client app, I want to provide optional context (`folder`, `ownerType`, `ownerId`), so that media can be grouped.
  - **Acceptance Criteria:** Optional metadata is validated and persisted when provided.

## Validation
- **US-003 (Must Have)**  
  As the system, I want to reject unsupported file types, so that invalid/dangerous uploads are blocked.
  - **Acceptance Criteria:** Unsupported file type returns `415 VALIDATION_ERROR`.

- **US-004 (Must Have)**  
  As the system, I want to enforce max file size, so that memory/storage abuse is reduced.
  - **Acceptance Criteria:** Oversized file returns `413`; provider upload is not attempted.

- **US-005 (Must Have)**  
  As an API consumer, I want clear validation errors, so that I can fix bad requests quickly.
  - **Acceptance Criteria:** Error includes code, message, and field detail.

## Cloud Storage
- **US-006 (Must Have)**  
  As the service, I want to upload accepted files to Cloudinary, so that files are delivered via secure URLs.
  - **Acceptance Criteria:** Upload response includes `publicId`, `secureUrl`, width/height/format.

- **US-007 (Should Have)**  
  As the service, I want provider failures normalized, so that clients receive predictable error responses.
  - **Acceptance Criteria:** Provider failure maps to `PROVIDER_ERROR` without secret leakage.

## Metadata Management
- **US-008 (Must Have)**  
  As the service, I want to store metadata in DB, so that uploads can be queried later.
  - **Acceptance Criteria:** Successful upload creates `uploads` table record.

- **US-009 (Should Have)**  
  As a maintainer, I want created/updated timestamps, so that lifecycle auditing is easier.
  - **Acceptance Criteria:** `createdAt` and `updatedAt` are auto-populated.

## Retrieval
- **US-010 (Must Have)**  
  As a client app, I want to fetch an upload by ID, so that I can display exact asset details.
  - **Acceptance Criteria:** Existing ID returns `200`; missing ID returns `404`.

- **US-011 (Should Have)**  
  As a client app, I want optional transform query params, so that I can request display-ready URLs.
  - **Acceptance Criteria:** Valid query params return `transformedUrl`.

## Transformation
- **US-012 (Must Have)**  
  As a frontend consumer, I want resized/optimized URLs, so that image performance improves.
  - **Acceptance Criteria:** `width/height/quality/format/fit` produce deterministic transformed URL.

- **US-013 (Could Have)**  
  As an app team, I want named variants, so that frontend logic can use fixed presets.
  - **Acceptance Criteria:** Post-MVP endpoint returns predefined variants.

## Deletion
- **US-014 (Must Have)**  
  As a client app, I want to delete uploads, so that stale assets can be removed.
  - **Acceptance Criteria:** Existing ID deletes provider asset + DB record and returns success.

- **US-015 (Should Have)**  
  As a maintainer, I want predictable missing-delete behavior, so clients can handle it cleanly.
  - **Acceptance Criteria:** Deleting unknown ID returns `404`.

## Listing
- **US-016 (Must Have)**  
  As a client app, I want to list uploads, so that I can build a media browser.
  - **Acceptance Criteria:** `GET /api/v1/uploads` returns newest-first array with capped limit.

- **US-017 (Should Have)**  
  As a client app, I want pagination/filtering, so that large datasets are manageable.
  - **Acceptance Criteria:** Post-MVP query support for `page`, `owner`, `folder`, `format`.

## Organization
- **US-018 (Should Have)**  
  As a client app, I want folder/category organization, so assets are easier to manage.
  - **Acceptance Criteria:** `folder` metadata can be stored and queried.

- **US-019 (Could Have)**  
  As a business app, I want ownership links (`ownerType`, `ownerId`), so media can map to domain entities.
  - **Acceptance Criteria:** Owner pair is validated and stored.

## Security
- **US-020 (Must Have)**  
  As the system, I want strict upload validation, so unsafe payloads are blocked early.
  - **Acceptance Criteria:** Missing/malformed/invalid uploads fail before provider or DB writes.

- **US-021 (Should Have)**  
  As a maintainer, I want rate limiting, so request bursts are controlled.
  - **Acceptance Criteria:** Post-MVP threshold returns `429`.

- **US-022 (Should Have)**  
  As a platform owner, I want auth + authorization checks, so only allowed actors can delete/replace.
  - **Acceptance Criteria:** Post-MVP delete/replace protected by identity + ownership rules.

## Maintainability / DX
- **US-023 (Must Have)**  
  As a backend engineer, I want layered module boundaries, so business logic is testable and reusable.
  - **Acceptance Criteria:** Route/controller/service/provider/repository boundaries are enforced.

- **US-024 (Must Have)**  
  As a contributor, I want OpenAPI docs, so endpoints are easy to discover and test.
  - **Acceptance Criteria:** Swagger covers all MVP routes and core request/response models.

- **US-025 (Must Have)**  
  As a reviewer, I want automated tests for core flows, so quality is demonstrable.
  - **Acceptance Criteria:** MVP critical scenarios pass in unit + integration suites.
