# System Architecture

## Architectural Style
Modular monolith with layered architecture:
- Routes
- Middleware
- Controllers
- Services
- Repositories (TypeORM)
- Entities
- Contracts + Providers
- Config/Common/Utils

## Why This Architecture
- Keeps business logic isolated from HTTP and infrastructure concerns.
- Improves testability and maintainability.
- Fits a solo portfolio project without microservice complexity.
- Keeps the upload service dependent on module-owned contracts instead of Cloudinary-specific types.

## Request Flow
`Client -> Route -> Multer Middleware -> Validation -> Controller -> Service -> MediaStorageProvider + Repository -> Response`

## Responsibility Mapping
- **Upload parsing:** `src/middleware/upload.middleware.ts`
- **Validation:** upload middleware + service validation
- **Media storage contract:** `src/modules/uploads/contracts/media-storage.contract.ts`
- **Cloudinary integration:** `src/providers/cloudinary`
- **Transformation URL logic:** `UploadService` using the media storage contract
- **DB operations:** `TypeOrmUploadRepository`
- **Pagination/filter execution:** repository layer
- **Error normalization:** `src/middleware/error-handler.middleware.ts`
- **Centralized configuration:** `src/config`

## Tradeoffs
- **Pros:** Fast delivery, simple deployment model, clear boundaries, storage provider can change later without rewriting the service.
- **Cons:** Single deployable runtime; abstraction remains intentionally narrow and storage-provider-oriented rather than fully generic.
- **Decision:** Appropriate for portfolio scope and the current feature set.

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
      Contract[Media Storage Contract]
      Repo[Upload Repository (TypeORM)]
      Provider[Cloudinary Provider]
      Err[Global Error Middleware]
    end

    DB[(PostgreSQL)]
    Cloud[(Cloudinary)]

    Client -->|HTTP Request| Routes
    Swagger -->|API contract reference| Routes
    Routes --> UploadMW --> Ctrl --> Svc
    Svc --> Contract --> Provider --> Cloud
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
    participant MSP as Media Storage Provider
    participant DB as PostgreSQL

    C->>R: POST /api/v1/uploads (multipart/form-data)
    R->>M: Parse multipart payload
    M->>V: Validate file presence, mime, extension, size
    V-->>R: Validated file + request data
    R->>CT: Forward validated request
    CT->>S: Execute upload use case
    S->>MSP: Upload image data
    MSP-->>S: publicId, secureUrl, dimensions, format
    S->>DB: Insert upload metadata record
    DB-->>S: persisted upload record
    S-->>CT: domain response object
    CT-->>C: 201 Created + structured JSON response
```
