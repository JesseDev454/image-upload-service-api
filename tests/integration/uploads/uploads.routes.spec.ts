import { randomUUID } from "crypto";

import request from "supertest";

import { createApp } from "../../../src/app";
import { UploadService } from "../../../src/modules/uploads/services/upload.service";
import { InMemoryUploadRepository } from "../../helpers/in-memory-upload-repository";
import { FakeCloudinaryProvider } from "../../mocks/fake-cloudinary-provider";

const createTestContext = (maxFileSizeBytes = 5 * 1024 * 1024) => {
  const repository = new InMemoryUploadRepository();
  const cloudinaryProvider = new FakeCloudinaryProvider();
  const uploadService = new UploadService(repository, cloudinaryProvider, {
    uploadDefaults: {
      maxFileSizeBytes,
      maxListLimit: 100,
      defaultListLimit: 20
    }
  });

  const app = createApp({
    uploadService,
    maxFileSizeBytes
  });

  return { app, repository, cloudinaryProvider };
};

const createImageUploadRequest = (
  app: ReturnType<typeof createApp>,
  options?: {
    filename?: string;
    contentType?: string;
    fileBuffer?: Buffer;
    fields?: Record<string, string>;
  }
) => {
  const requestBuilder = request(app).post("/api/v1/uploads");
  const fields = options?.fields ?? {};

  for (const [key, value] of Object.entries(fields)) {
    requestBuilder.field(key, value);
  }

  return requestBuilder.attach("image", options?.fileBuffer ?? Buffer.from("valid-image-content"), {
    filename: options?.filename ?? "sample.jpg",
    contentType: options?.contentType ?? "image/jpeg"
  });
};

describe("Uploads API integration", () => {
  it("creates a valid upload successfully", async () => {
    const { app, repository } = createTestContext();

    const response = await createImageUploadRequest(app, {
      fields: {
        folder: "products"
      }
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.publicId).toContain("products/");
    expect(repository.getRecords()).toHaveLength(1);
  });

  it("creates a valid upload with owner association", async () => {
    const { app } = createTestContext();

    const response = await createImageUploadRequest(app, {
      fields: {
        ownerType: "user",
        ownerId: "user-123"
      }
    });

    expect(response.status).toBe(201);
    expect(response.body.data.ownerType).toBe("user");
    expect(response.body.data.ownerId).toBe("user-123");
  });

  it("rejects ownerType without ownerId", async () => {
    const { app } = createTestContext();

    const response = await createImageUploadRequest(app, {
      fields: {
        ownerType: "user"
      }
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects ownerId without ownerType", async () => {
    const { app } = createTestContext();

    const response = await createImageUploadRequest(app, {
      fields: {
        ownerId: "user-123"
      }
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid mime type", async () => {
    const { app } = createTestContext();

    const response = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("not-image"), {
        filename: "sample.txt",
        contentType: "text/plain"
      });

    expect(response.status).toBe(415);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects oversized files", async () => {
    const { app } = createTestContext(8);

    const response = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("this-buffer-is-too-large"), {
        filename: "sample.jpg",
        contentType: "image/jpeg"
      });

    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects missing file payload", async () => {
    const { app } = createTestContext();

    const response = await request(app).post("/api/v1/uploads").field("folder", "products");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns provider error when upload fails", async () => {
    const { app, cloudinaryProvider } = createTestContext();
    cloudinaryProvider.shouldFailUpload = true;

    const response = await createImageUploadRequest(app);

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe("PROVIDER_ERROR");
  });

  it("returns upload by id", async () => {
    const { app } = createTestContext();

    const createResponse = await createImageUploadRequest(app);

    const id = createResponse.body.data.id as string;
    const response = await request(app).get(`/api/v1/uploads/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(id);
  });

  it("returns upload owner association by id", async () => {
    const { app } = createTestContext();

    const createResponse = await createImageUploadRequest(app, {
      fields: {
        ownerType: "product",
        ownerId: "product-456"
      }
    });

    const id = createResponse.body.data.id as string;
    const response = await request(app).get(`/api/v1/uploads/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.ownerType).toBe("product");
    expect(response.body.data.ownerId).toBe("product-456");
  });

  it("returns 404 for unknown id", async () => {
    const { app } = createTestContext();
    const response = await request(app).get(`/api/v1/uploads/${randomUUID()}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("lists uploads with default pagination", async () => {
    const { app } = createTestContext();

    await createImageUploadRequest(app, {
      fileBuffer: Buffer.from("first-image"),
      filename: "first.jpg"
    });

    await createImageUploadRequest(app, {
      fileBuffer: Buffer.from("second-image"),
      filename: "second.jpg"
    });

    const response = await request(app).get("/api/v1/uploads");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Uploads retrieved successfully");
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1
    });
    expect(response.body.data.filters).toEqual({
      format: null,
      mimeType: null,
      ownerType: null,
      ownerId: null
    });
  });

  it("rejects unexpected multipart file fields", async () => {
    const { app } = createTestContext();

    const response = await request(app)
      .post("/api/v1/uploads")
      .attach("avatar", Buffer.from("valid-image-content"), {
        filename: "sample.jpg",
        contentType: "image/jpeg"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("deletes upload by id", async () => {
    const { app, repository } = createTestContext();

    const createResponse = await createImageUploadRequest(app);

    const id = createResponse.body.data.id as string;
    const deleteResponse = await request(app).delete(`/api/v1/uploads/${id}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.deleted).toBe(true);
    expect(repository.getRecords()).toHaveLength(0);
  });

  it("returns 404 when deleting missing record", async () => {
    const { app } = createTestContext();
    const response = await request(app).delete(`/api/v1/uploads/${randomUUID()}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("generates transformed url for valid query params", async () => {
    const { app } = createTestContext();

    const createResponse = await createImageUploadRequest(app);

    const id = createResponse.body.data.id as string;
    const response = await request(app).get(
      `/api/v1/uploads/${id}?width=300&height=200&quality=auto&format=webp&fit=fill`
    );

    expect(response.status).toBe(200);
    expect(response.body.data.transformedUrl).toContain("width=300");
    expect(response.body.data.transformedUrl).toContain("format=webp");
  });

  it("rejects invalid transform query", async () => {
    const { app } = createTestContext();

    const createResponse = await createImageUploadRequest(app);
    const id = createResponse.body.data.id as string;

    const response = await request(app).get(`/api/v1/uploads/${id}?width=-1`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("supports custom page and limit values", async () => {
    const { app } = createTestContext();

    const firstCreateResponse = await createImageUploadRequest(app, {
      fileBuffer: Buffer.from("first-image"),
      filename: "first.jpg"
    });
    const secondCreateResponse = await createImageUploadRequest(app, {
      fileBuffer: Buffer.from("second-image"),
      filename: "second.jpg"
    });
    await createImageUploadRequest(app, {
      fileBuffer: Buffer.from("third-image"),
      filename: "third.jpg"
    });

    const response = await request(app).get("/api/v1/uploads?page=2&limit=1");

    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toEqual({
      page: 2,
      limit: 1,
      total: 3,
      totalPages: 3
    });
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].id).toBe(secondCreateResponse.body.data.id);
    expect(response.body.data.items[0].id).not.toBe(firstCreateResponse.body.data.id);
  });

  it("rejects invalid page values", async () => {
    const { app } = createTestContext();

    const response = await request(app).get("/api/v1/uploads?page=0");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid limit values", async () => {
    const { app } = createTestContext();

    const response = await request(app).get("/api/v1/uploads?limit=200");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("filters uploads by format", async () => {
    const { app } = createTestContext();

    await createImageUploadRequest(app, {
      filename: "sample.jpg",
      contentType: "image/jpeg"
    });
    await createImageUploadRequest(app, {
      filename: "sample.png",
      contentType: "image/png"
    });

    const response = await request(app).get("/api/v1/uploads?format=png");

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].format).toBe("png");
    expect(response.body.data.filters.format).toBe("png");
  });

  it("filters uploads by ownerType and ownerId", async () => {
    const { app } = createTestContext();

    await createImageUploadRequest(app, {
      fields: {
        ownerType: "user",
        ownerId: "user-1"
      }
    });
    await createImageUploadRequest(app, {
      fields: {
        ownerType: "product",
        ownerId: "product-1"
      }
    });

    const response = await request(app).get("/api/v1/uploads?ownerType=user&ownerId=user-1");

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].ownerType).toBe("user");
    expect(response.body.data.items[0].ownerId).toBe("user-1");
  });

  it("preserves newest-first ordering within paginated results", async () => {
    const { app } = createTestContext();

    const firstCreateResponse = await createImageUploadRequest(app, {
      fileBuffer: Buffer.from("first-image"),
      filename: "first.jpg"
    });
    const secondCreateResponse = await createImageUploadRequest(app, {
      fileBuffer: Buffer.from("second-image"),
      filename: "second.jpg"
    });

    const response = await request(app).get("/api/v1/uploads?page=1&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data.items[0].id).toBe(secondCreateResponse.body.data.id);
    expect(response.body.data.items[1].id).toBe(firstCreateResponse.body.data.id);
  });
});
