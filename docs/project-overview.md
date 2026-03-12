# Project Overview

## Summary
File Upload + Image Processing API is a reusable backend service for handling image media workflows in real applications.  
It receives `multipart/form-data` uploads, validates files, stores assets in Cloudinary, saves metadata in PostgreSQL, and exposes retrieval/listing/deletion APIs with transformation URL support.

## Problem Statement
Image handling is a repeated backend problem across SaaS and business apps.  
Teams often re-implement upload validation, cloud storage integration, metadata persistence, and transformed delivery URLs per project.  
This service centralizes that concern into one maintainable API module.

## Project Goals
- Safely accept image uploads.
- Enforce strict type/size validation.
- Persist upload metadata for queryability.
- Integrate cloud-hosted media delivery.
- Generate transformed image URLs for optimized frontend rendering.
- Expose clean REST contracts with predictable error handling.
- Demonstrate portfolio-grade backend architecture, testing, and documentation.

## MVP In Scope
- Single image upload endpoint.
- MIME + extension validation (`jpg`, `jpeg`, `png`, `webp`).
- Max file size enforcement.
- Cloudinary upload + secure URL return.
- Metadata persistence in `uploads` table.
- List uploads (newest-first, capped limit).
- Retrieve one upload by ID.
- Delete upload (Cloudinary + DB hard delete).
- Transformation URL generation via retrieve query parameters.
- Swagger/OpenAPI docs.
- Unit + integration tests for core flows.

## Out of Scope (MVP)
- Video/document uploads.
- AI moderation/malware pipeline.
- Background workers or queues.
- Multi-cloud abstraction.
- Chunked/resumable uploads.
- Auth/RBAC and tenant authorization.
- Signed direct upload flows.
- Frontend implementation.
- Deployment/DevOps automation.

## Success Criteria
Project is successful when:
- End-to-end upload lifecycle is stable and test-backed.
- Invalid payloads are rejected with consistent, safe error responses.
- Architecture is layered and maintainable.
- API contracts are documented and consumable via Swagger.
- Repo documentation is complete enough for independent review/handoff.
