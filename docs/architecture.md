# System Architecture

## Architectural Style
Modular monolith with layered architecture:
- Routes
- Middleware
- Controllers
- Services
- Repositories (TypeORM)
- Entities
- Providers (Cloudinary)
- Config/Common/Utils

## Why This Architecture
- Keeps business logic isolated from HTTP and infrastructure concerns.
- Improves testability and maintainability.
- Fits a solo portfolio project without microservice complexity.
- Enables straightforward post-MVP extensions (auth, rate limiting, soft delete).

## Request Flow
`Client -> Route -> Multer Middleware -> Validation -> Controller -> Service -> Cloudinary + Repository -> Response`

## Responsibility Mapping
- **Upload parsing:** `src/middleware/upload.middleware.ts`
- **Validation:** upload middleware + service validation.
- **Cloudinary integration:** `src/providers/cloudinary`
- **Transformation URL logic:** `UploadService` using cloud provider adapter.
- **DB operations:** `TypeOrmUploadRepository`
- **Error normalization:** `src/middleware/error-handler.middleware.ts`
- **Centralized configuration:** `src/config`

## Tradeoffs
- **Pros:** Fast delivery, simple deployment model, clear code boundaries.
- **Cons:** Single deployable unit; no independent horizontal scaling by module.
- **Decision:** Acceptable for MVP and portfolio scope.

## High-Level Architecture Diagram
```mermaid
flowchart LR
    Client[Client App]
    Response[JSON Response]
    Swagger[Swagger Docs / OpenAPI]

    subgraph API[Express API Service]
      Routes[Routes]
      UploadMW[Upload Middleware (Multer)]
      Ctrl[Upload Controller]
      Svc[Upload Service]
      Repo[Upload Repository (TypeORM)]
      Provider[Cloudinary Provider]
      Err[Global Error Middleware]
    end

    DB[(PostgreSQL)]
    Cloud[(Cloudinary)]

    Client -->|HTTP Request| Routes
    Swagger -->|API contract reference| Routes
    Routes --> UploadMW --> Ctrl --> Svc
    Svc --> Provider --> Cloud
    Svc --> Repo --> DB
    Svc --> Ctrl --> Routes --> Err --> Response --> Client
```

## Upload Request Flow Diagram
```mermaid
sequenceDiagram
    participant C as Client App
    participant R as Express Route
    participant M as Multer Middleware
    participant V as Validation Layer
    participant CT as Upload Controller
    participant S as Upload Service
    participant CL as Cloudinary
    participant DB as PostgreSQL

    C->>R: POST /api/v1/uploads (multipart/form-data)
    R->>M: Parse multipart payload
    M->>V: Validate file presence, mime, extension, size
    V-->>R: Validated file + request data
    R->>CT: Forward validated request
    CT->>S: Execute upload use case
    S->>CL: Upload image data
    CL-->>S: publicId, secureUrl, dimensions, format
    S->>DB: Insert upload metadata record
    DB-->>S: persisted upload record
    S-->>CT: domain response object
    CT-->>C: 201 Created + structured JSON response
```
