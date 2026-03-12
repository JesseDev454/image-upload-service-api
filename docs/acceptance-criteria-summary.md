# Acceptance Criteria Summary (MVP)

MVP is complete when all are true:

- `POST /api/v1/uploads` accepts valid single image and returns `201` with persisted metadata.
- Invalid MIME/extension returns `415` with structured `VALIDATION_ERROR`.
- Oversized file returns `413` and prevents provider upload call.
- Missing file returns `400` with validation detail.
- Successful cloud upload is followed by DB metadata persistence.
- `GET /api/v1/uploads/:id` returns record for valid ID, `404` for missing ID.
- `GET /api/v1/uploads` returns newest-first collection with bounded limit.
- `DELETE /api/v1/uploads/:id` removes cloud asset and DB record.
- Retrieve endpoint supports valid transform query params and returns transformed URL.
- Error envelope is consistent across validation/not found/provider/internal failures.
- Automated tests cover major success and failure paths.
- Swagger/OpenAPI accurately documents implemented endpoints.
- Core documentation files under `docs/` are complete and consistent.
