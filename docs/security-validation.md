# Security and Validation Design

## File Validation
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`.
- Validate both MIME and extension.
- Reject unsupported payloads with `415 VALIDATION_ERROR`.

## Size and Multipart Constraints
- Max file size default: `5MB` (configurable via env).
- Enforced in Multer middleware.
- Oversize returns `413`.
- Missing file returns `400`.

## Input Safety
- Sanitize `originalName` before persistence.
- Sanitize and length-limit optional text metadata (`folder`, `ownerType`, `ownerId`, `uploadedBy`).
- Validate owner metadata consistency (`ownerType` + `ownerId` pair rule).

## Cloudinary Safety Controls
- Public ID generated server-side (`<folder>/<year>/<month>/<uuid>`).
- Do not trust client-provided filenames for public IDs.
- Keep `publicId` unique in DB.

## Error Handling and Leakage Prevention
- Use structured error responses with safe messages.
- Do not expose stack traces, credentials, or provider internals in API responses.
- Log request ID and normalized error metadata only.

## Authentication and Authorization
- MVP: no auth/RBAC (trusted API consumer assumption).
- Post-MVP: add auth middleware and ownership checks for delete/replace actions.

## Rate Limiting
- Deferred to post-MVP security sprint.
- Planned behavior: `429` for threshold violations.

## Secrets and Configuration Hygiene
- Use environment variables for all secrets.
- Keep `.env` out of source control.
- Provide `.env.example`/`.env.test.example` for onboarding.
- Validate required secrets at startup.

## Included vs Deferred Security Scope
- **Included (MVP):** strict validation, size limits, safe metadata handling, env hygiene, normalized safe errors.
- **Deferred (Post-MVP):** auth/RBAC, rate limiting, audit logs, file signature sniffing, signed upload flows.
