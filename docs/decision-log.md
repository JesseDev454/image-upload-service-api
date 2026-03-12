# Decision Log

## ADR-001 — Use PostgreSQL
- **Decision:** PostgreSQL selected as primary relational database.
- **Rationale:** Strong constraints/indexing, UUID support, mature TypeORM integration.
- **Tradeoff:** Slightly heavier local setup than MySQL.

## ADR-002 — Use Cloudinary
- **Decision:** Cloudinary chosen as image provider and transformation engine.
- **Rationale:** Fast integration for upload, delete, and URL-based transformations.
- **Tradeoff:** Vendor lock-in risk if provider abstraction is weak.

## ADR-003 — Express + TypeScript
- **Decision:** Build API with Express and TypeScript.
- **Rationale:** Practical ecosystem, low setup overhead, strong maintainability with typing.
- **Tradeoff:** Requires discipline to keep runtime/typing contracts aligned.

## ADR-004 — Modular Layered Monolith
- **Decision:** Use layered modular monolith architecture.
- **Rationale:** Best fit for solo portfolio scope and maintainable complexity.
- **Tradeoff:** Single deployable runtime unit.

## ADR-005 — No Microservices
- **Decision:** Reject microservices for MVP.
- **Rationale:** Domain scope is small; distributed ops overhead is unnecessary.
- **Tradeoff:** Less independent scaling granularity by module.

## ADR-006 — Dynamic Transform URLs
- **Decision:** Generate transformed URLs dynamically from `publicId` and query params.
- **Rationale:** Avoids variant persistence complexity in MVP.
- **Tradeoff:** No fixed named variants until post-MVP.

## ADR-007 — Hard Delete in MVP
- **Decision:** Use hard delete now, keep `deletedAt` column reserved.
- **Rationale:** Simpler lifecycle semantics for first implementation.
- **Tradeoff:** No restore/audit behavior until soft delete is implemented.

## ADR-008 — Defer Auth/RBAC and Rate Limiting
- **Decision:** Keep auth/RBAC and rate limiting out of MVP.
- **Rationale:** Prioritize core upload lifecycle and architecture quality first.
- **Tradeoff:** MVP assumes trusted callers and is not security-complete.

## ADR-009 — Defer Multiple Upload and Replacement
- **Decision:** Keep batch upload and replace endpoints post-MVP.
- **Rationale:** Reduces early complexity and edge-case surface area.
- **Tradeoff:** MVP supports only one-file-per-request.
