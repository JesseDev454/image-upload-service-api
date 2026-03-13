import { randomUUID } from "crypto";
import { Readable } from "stream";

import { AppError } from "../../../src/common/errors/app-error";
import { UploadService } from "../../../src/modules/uploads/services/upload.service";
import { InMemoryUploadRepository } from "../../helpers/in-memory-upload-repository";
import { FakeCloudinaryProvider } from "../../mocks/fake-cloudinary-provider";

const createMockFile = (): Express.Multer.File => {
  return {
    fieldname: "image",
    originalname: "sample.jpg",
    encoding: "7bit",
    mimetype: "image/jpeg",
    size: 1024,
    destination: "",
    filename: "",
    path: "",
    buffer: Buffer.from("sample-image-content"),
    stream: Readable.from([])
  };
};

describe("UploadService", () => {
  it("throws validation error when ownerType is provided without ownerId", async () => {
    const repository = new InMemoryUploadRepository();
    const cloudinaryProvider = new FakeCloudinaryProvider();
    const service = new UploadService(repository, cloudinaryProvider, {
      uploadDefaults: {
        maxFileSizeBytes: 5 * 1024 * 1024,
        maxListLimit: 50,
        defaultListLimit: 20
      }
    });

    await expect(
      service.createUpload({
        file: createMockFile(),
        metadata: {
          ownerType: "user"
        }
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  });

  it("returns paginated list results with default pagination metadata", async () => {
    const repository = new InMemoryUploadRepository();
    const cloudinaryProvider = new FakeCloudinaryProvider();
    const service = new UploadService(repository, cloudinaryProvider, {
      uploadDefaults: {
        maxFileSizeBytes: 5 * 1024 * 1024,
        maxListLimit: 100,
        defaultListLimit: 20
      }
    });

    await service.createUpload({ file: createMockFile(), metadata: {} });

    const result = await service.listUploads({});
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1
    });
    expect(result.items).toHaveLength(1);
    expect(result.filters).toEqual({
      format: null,
      mimeType: null,
      ownerType: null,
      ownerId: null
    });
  });

  it("throws validation error when limit exceeds configured maximum", async () => {
    const repository = new InMemoryUploadRepository();
    const cloudinaryProvider = new FakeCloudinaryProvider();
    const service = new UploadService(repository, cloudinaryProvider, {
      uploadDefaults: {
        maxFileSizeBytes: 5 * 1024 * 1024,
        maxListLimit: 2,
        defaultListLimit: 1
      }
    });

    await expect(service.listUploads({ limit: 100 })).rejects.toMatchObject({
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  });

  it("returns transformed url when transformation query is provided", async () => {
    const repository = new InMemoryUploadRepository();
    const cloudinaryProvider = new FakeCloudinaryProvider();
    const service = new UploadService(repository, cloudinaryProvider, {
      uploadDefaults: {
        maxFileSizeBytes: 5 * 1024 * 1024,
        maxListLimit: 50,
        defaultListLimit: 20
      }
    });

    const created = await service.createUpload({
      file: createMockFile(),
      metadata: {}
    });

    const fetched = await service.getUploadById(created.id, {
      width: 400,
      height: 300,
      format: "webp"
    });

    expect(fetched.transformedUrl).toContain("width=400");
    expect(fetched.transformedUrl).toContain("format=webp");
  });

  it("throws not found error when deleting unknown id", async () => {
    const repository = new InMemoryUploadRepository();
    const cloudinaryProvider = new FakeCloudinaryProvider();
    const service = new UploadService(repository, cloudinaryProvider, {
      uploadDefaults: {
        maxFileSizeBytes: 5 * 1024 * 1024,
        maxListLimit: 50,
        defaultListLimit: 20
      }
    });

    await expect(service.deleteUploadById(randomUUID())).rejects.toBeInstanceOf(AppError);
  });

  it("filters uploads by owner association", async () => {
    const repository = new InMemoryUploadRepository();
    const cloudinaryProvider = new FakeCloudinaryProvider();
    const service = new UploadService(repository, cloudinaryProvider, {
      uploadDefaults: {
        maxFileSizeBytes: 5 * 1024 * 1024,
        maxListLimit: 100,
        defaultListLimit: 20
      }
    });

    await service.createUpload({
      file: createMockFile(),
      metadata: {
        ownerType: "user",
        ownerId: "user-1"
      }
    });

    await service.createUpload({
      file: createMockFile(),
      metadata: {
        ownerType: "product",
        ownerId: "product-1"
      }
    });

    const result = await service.listUploads({
      ownerType: "user",
      ownerId: "user-1"
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].ownerType).toBe("user");
    expect(result.items[0].ownerId).toBe("user-1");
  });
});
