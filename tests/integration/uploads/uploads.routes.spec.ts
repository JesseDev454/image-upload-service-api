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
      maxListLimit: 50,
      defaultListLimit: 20
    }
  });

  const app = createApp({
    uploadService,
    maxFileSizeBytes
  });

  return { app, repository, cloudinaryProvider };
};

describe("Uploads API integration", () => {
  it("creates a valid upload successfully", async () => {
    const { app, repository } = createTestContext();

    const response = await request(app)
      .post("/api/v1/uploads")
      .field("folder", "products")
      .attach("image", Buffer.from("valid-image-content"), {
        filename: "sample.jpg",
        contentType: "image/jpeg"
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.publicId).toContain("products/");
    expect(repository.getRecords()).toHaveLength(1);
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

    const response = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("valid-image-content"), {
        filename: "sample.jpg",
        contentType: "image/jpeg"
      });

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe("PROVIDER_ERROR");
  });

  it("returns upload by id", async () => {
    const { app } = createTestContext();

    const createResponse = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("valid-image-content"), {
        filename: "sample.jpg",
        contentType: "image/jpeg"
      });

    const id = createResponse.body.data.id as string;
    const response = await request(app).get(`/api/v1/uploads/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(id);
  });

  it("returns 404 for unknown id", async () => {
    const { app } = createTestContext();
    const response = await request(app).get(`/api/v1/uploads/${randomUUID()}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("lists uploads ordered by newest", async () => {
    const { app } = createTestContext();

    const firstCreateResponse = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("first-image"), {
        filename: "first.jpg",
        contentType: "image/jpeg"
      });

    const secondCreateResponse = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("second-image"), {
        filename: "second.jpg",
        contentType: "image/jpeg"
      });

    const response = await request(app).get("/api/v1/uploads");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].id).toBe(secondCreateResponse.body.data.id);
    expect(response.body.data[1].id).toBe(firstCreateResponse.body.data.id);
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

    const createResponse = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("valid-image-content"), {
        filename: "sample.jpg",
        contentType: "image/jpeg"
      });

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

    const createResponse = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("valid-image-content"), {
        filename: "sample.jpg",
        contentType: "image/jpeg"
      });

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

    const createResponse = await request(app)
      .post("/api/v1/uploads")
      .attach("image", Buffer.from("valid-image-content"), {
        filename: "sample.jpg",
        contentType: "image/jpeg"
      });
    const id = createResponse.body.data.id as string;

    const response = await request(app).get(`/api/v1/uploads/${id}?width=-1`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
