# API Design

## API Conventions
- Base path: `/api/v1`
- Versioning: URI versioning
- Response format: JSON envelope with `meta.requestId`
- Upload content type: `multipart/form-data`
- ID format: UUID

## Response Envelope

### Success
```json
{
  "success": true,
  "message": "Uploads retrieved successfully",
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

## Implemented Endpoints

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
- **Status Codes:** `201`, `400`, `413`, `415`, `502`, `500`

### `GET /api/v1/uploads`
- **Purpose:** List upload records.
- **Query:**
  - `page` (optional, default `1`)
  - `limit` (optional, default `20`, max `100`)
  - `format` (optional: `jpg`, `jpeg`, `png`, `webp`)
  - `mimeType` (optional: `image/jpeg`, `image/png`, `image/webp`)
  - `ownerType` (optional)
  - `ownerId` (optional)
- **Response Shape:**
  - `data.items`
  - `data.pagination`
  - `data.filters`
- **Sort:** newest-first by `createdAt`, deterministic tie-break by `id`
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

## Listing Strategy
- Current implementation uses page-based pagination and optional filtering by `format`, `mimeType`, `ownerType`, and `ownerId`.
- The service parses and validates the query, and the repository owns DB pagination/filter execution.

## Resource Association Strategy
- Uploads can optionally belong to a business resource using `ownerType` and `ownerId`.
- The pair rule is enforced consistently at upload creation time.
- Association remains generic so the media service can be reused across different domains without hardcoding only `user` or `product`.

## Transformation Strategy
- Dynamic transformation URL generation uses stored `publicId` plus query parameters.
- Fixed named variants remain post-MVP.
