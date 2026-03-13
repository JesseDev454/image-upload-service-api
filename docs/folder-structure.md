# Recommended Folder Structure

```text
src/
  app.ts
  server.ts
  config/
  common/
  middleware/
  modules/
    uploads/
      contracts/
      controllers/
      dto/
      entities/
      repositories/
      routes/
      services/
      types/
  providers/
    cloudinary/
  utils/
  types/

tests/
  integration/
  unit/
  helpers/
  mocks/
  fixtures/

docs/
```

## Responsibility Guide
- **`src/config`**: env loading, DB config, Swagger config
- **`src/common`**: shared error/response/logging primitives
- **`src/middleware`**: request-id, upload parsing, centralized error handling
- **`src/modules/uploads/contracts`**: domain-owned interfaces for storage/provider boundaries
- **`src/modules/uploads`**: upload domain logic by layer (controller/service/repository/entity/type/dto)
- **`src/providers/cloudinary`**: Cloudinary adapter implementing the upload module storage contract
- **`src/utils`**: reusable validators and helper functions
- **`src/types`**: app-wide TS declaration files
- **`tests/unit`**: isolated service and utility tests
- **`tests/integration`**: API-level behavior tests
- **`docs`**: planning and architecture documentation

## What Should Not Go Where
- No business logic in routes
- No provider/DB access in controllers
- No Express response shaping in repository/provider layers
- No Cloudinary-specific response mapping inside upload service logic
- No unrelated utility dumping in `utils`
