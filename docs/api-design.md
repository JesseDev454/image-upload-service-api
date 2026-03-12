# API Design

## API Conventions
- Base path: `/api/v1`
- Versioning: URI versioning
- Response format: JSON envelope
- Upload content type: `multipart/form-data`
- ID format: UUID

## Response Envelope

### Success
```json
{
  "success": true,
  "message": "Upload created successfully",
  "data": {},
  "meta": { "requestId": "req_123" }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "image", "issue": "Unsupported mime type" }]
  },
  "meta": { "requestId": "req_123" }
}
```

## MVP Endpoints

### `POST /api/v1/uploads`
- **Purpose:** Upload single image and persist metadata.
- **Content-Type:** `multipart/form-data`
- **Body Fields:**
  - `image` (required file)
  - `folder`, `ownerType`, `ownerId`, `uploadedBy` (optional text)
- **Validation:**
  - file is required
  - allowed MIME + extension
  - max file size
  - `ownerType` and `ownerId` must be provided together
- **Status Codes:** `201`, `400`, `413`, `415`, `422`, `502`, `500`

### `GET /api/v1/uploads`
- **Purpose:** List upload records.
- **Query (MVP):** `limit` (optional, default 20, max 50)
- **Sort:** newest-first by `createdAt`
- **Status Codes:** `200`, `400`, `500`

### `GET /api/v1/uploads/:id`
- **Purpose:** Get upload metadata by ID and optionally transformed URL.
- **Path Param:** `id` (UUID)
- **Query Params:** `width`, `height`, `quality`, `format`, `fit`
- **Status Codes:** `200`, `400`, `404`, `500`

### `DELETE /api/v1/uploads/:id`
- **Purpose:** Delete upload from Cloudinary and DB.
- **Path Param:** `id` (UUID)
- **Status Codes:** `200`, `400`, `404`, `502`, `500`

## Optional Post-MVP Endpoints
- `POST /api/v1/uploads/multiple`
- `GET /api/v1/uploads/:id/url`
- `PATCH /api/v1/uploads/:id/replace`
- `GET /api/v1/uploads/:id/variants`

## Listing Strategy
- MVP: capped `limit` + newest-first sorting.
- Post-MVP: page-based pagination and filtering (`owner`, `folder`, `format`, date range).

## Transformation Strategy
- MVP: dynamic transformation URL generation using stored `publicId` and query params.
- Post-MVP: persisted named variants only when fixed presets are required.
