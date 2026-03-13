# Decision Log

## ADR-001 — Use PostgreSQL
- **Decision:** PostgreSQL selected as primary relational database.
- **Rationale:** Strong constraints/indexing, UUID support, mature TypeORM integration.
- **Tradeoff:** Slightly heavier local setup than MySQL.

## ADR-002 — Use Cloudinary
- **Decision:** Cloudinary chosen as image provider and transformation engine.
- **Rationale:** Fast integration for upload, delete, and URL-based transformations.
- **Tradeoff:** Vendor lock-in risk exists, so the upload module should not depend on Cloudinary-specific types.

## ADR-003 — Express + TypeScript
- **Decision:** Build API with Express and TypeScript.
- **Rationale:** Practical ecosystem, low setup overhead, strong maintainability with typing.
- **Tradeoff:** Requires discipline to keep runtime and typing contracts aligned.

## ADR-004 — Modular Layered Monolith
- **Decision:** Use layered modular monolith architecture.
- **Rationale:** Best fit for solo portfolio scope and maintainable complexity.
- **Tradeoff:** Single deployable runtime unit.

## ADR-005 — Keep a Narrow Media Storage Contract
- **Decision:** The upload service depends on a module-owned media storage provider contract.
- **Rationale:** Upload, delete, and transformed URL generation are expressed through one small interface, which keeps service logic infrastructure-agnostic without overengineering.
- **Tradeoff:** Adds a small interface/type surface area, but avoids a broader architectural rewrite.

## ADR-006 — Dynamic Transform URLs
- **Decision:** Generate transformed URLs dynamically from `publicId` and query params.
- **Rationale:** Avoids variant persistence complexity in the current scope.
- **Tradeoff:** No fixed named variants until post-MVP.

## ADR-007 — Hard Delete in MVP
- **Decision:** Use hard delete now, keep `deletedAt` column reserved.
- **Rationale:** Simpler lifecycle semantics for the current implementation.
- **Tradeoff:** No restore/audit behavior until soft delete is implemented.

## ADR-008 — Paginated, Filterable Listing
- **Decision:** Upgrade listing to page-based pagination with optional filtering by `format`, `mimeType`, `ownerType`, and `ownerId`.
- **Rationale:** Improves API realism and scalability without changing the core upload lifecycle.
- **Tradeoff:** The list response shape becomes more structured than the original plain array.

## ADR-009 — Defer Auth/RBAC, Rate Limiting, and Batch Upload
- **Decision:** Keep auth/RBAC, rate limiting, multi-upload, and replacement endpoints out of the current implementation.
- **Rationale:** Preserves focus on the upload lifecycle, query design, contracts, and CI quality.
- **Tradeoff:** The service is more reusable and presentable, but still intentionally not security-complete.
