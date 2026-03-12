# Sprint Plan

## Sprint 0 — Planning and Design
- **Goal:** Lock architecture, requirements, API contract, and test strategy.
- **Deliverables:** Full `docs/` planning package and implementation roadmap.
- **Definition of Done:** Decision-complete baseline approved.

## Sprint 1 — Setup and Foundation
- **Goal:** Establish project skeleton and quality tooling.
- **Deliverables:** TypeScript/Express setup, env config, DB config, lint/format, response/error framework.
- **Definition of Done:** App boots locally with base routes and quality scripts.

## Sprint 2 — Single Image Upload
- **Goal:** Implement end-to-end single upload flow.
- **Deliverables:** Upload endpoint, validation, Cloudinary upload, metadata persistence.
- **Definition of Done:** Valid upload works; invalid cases rejected with tests.

## Sprint 3 — Retrieval and Deletion
- **Goal:** Complete read/list/delete lifecycle.
- **Deliverables:** Get by ID, list uploads, delete upload.
- **Definition of Done:** Retrieval and deletion behaviors pass integration tests.

## Sprint 4 — Transformation URL Generation
- **Goal:** Add transformation query support.
- **Deliverables:** Query validation + transformed URL generation.
- **Definition of Done:** Transform URL returned for valid options; invalid query rejected.

## Sprint 5 — Multiple Upload + Organization (Post-MVP)
- **Goal:** Extend usability features.
- **Deliverables:** Multi-upload endpoint, organization fields, pagination/filtering.
- **Definition of Done:** Extended endpoints tested and documented.

## Sprint 6 — Security Hardening (Post-MVP)
- **Goal:** Improve operational safety.
- **Deliverables:** Rate limiting, stronger content validation, auth/authorization integration plan.
- **Definition of Done:** Security hardening checklist completed for selected scope.

## Sprint 7 — Test and Documentation Polish
- **Goal:** Portfolio-level final quality pass.
- **Deliverables:** Coverage improvements, docs polish, final roadmap updates.
- **Definition of Done:** Stable tests and recruiter-ready repository presentation.
