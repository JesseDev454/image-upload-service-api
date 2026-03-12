# Testing Strategy

## Testing Goals
- Verify the end-to-end upload lifecycle behavior.
- Prevent regressions in validation and error handling.
- Confirm API contract stability for client integrations.
- Ensure provider failures are handled safely.

## Test Types
- **Unit Tests:** service logic, query parsing, validation helpers.
- **Integration Tests:** route + middleware + controller + service with in-memory repository and mock provider.
- **Optional E2E (future):** run against real Cloudinary sandbox + dedicated test DB.

## What to Mock
- Cloudinary upload/delete behavior.
- Provider failure scenarios.
- Deterministic utility behavior where needed.

## What to Keep Real
- Express request lifecycle.
- Multer middleware and validation behavior.
- Controller/service orchestration.
- Repository interaction contracts.

## Core MVP Test Cases
- Valid upload succeeds (`201`).
- Invalid MIME/extension rejected (`415`).
- File too large rejected (`413`).
- Missing file rejected (`400`).
- Provider upload failure mapped safely (`502 PROVIDER_ERROR`).
- Metadata persists after successful upload.
- Get by ID returns record (`200`).
- Get by ID returns `404` when missing.
- List endpoint returns collection sorted newest-first.
- Delete existing record returns success.
- Delete missing record returns `404`.
- Transformed URL generation works for valid query params.
- Invalid transform query returns `400`.

## Test Environment Considerations
- Isolate runtime config from dev/prod settings.
- Use deterministic fakes for cloud provider in default test suite.
- Keep test data independent per test case.
- Add dedicated test DB in later hardening phase.

## Coverage Target
- 70–80% for critical backend modules.
- Prioritize high-risk paths (validation, upload workflow, deletion, error mapping) over vanity percentages.

## Test Folder Layout
- `tests/unit/uploads/*.spec.ts`
- `tests/integration/uploads/*.spec.ts`
- `tests/helpers/*`
- `tests/mocks/*`
- `tests/fixtures/*` (optional)
