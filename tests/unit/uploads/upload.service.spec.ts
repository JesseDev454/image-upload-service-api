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
    ).rejects.toBeInstanceOf(AppError);
  });

  it("caps list limit at configured maximum", async () => {
    const repository = new InMemoryUploadRepository();
    const cloudinaryProvider = new FakeCloudinaryProvider();
    const service = new UploadService(repository, cloudinaryProvider, {
      uploadDefaults: {
        maxFileSizeBytes: 5 * 1024 * 1024,
        maxListLimit: 2,
        defaultListLimit: 1
      }
    });

    await service.createUpload({ file: createMockFile(), metadata: {} });
    await service.createUpload({ file: createMockFile(), metadata: {} });
    await service.createUpload({ file: createMockFile(), metadata: {} });

    const result = await service.listUploads(100);
    expect(result.limit).toBe(2);
    expect(result.uploads).toHaveLength(2);
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
});
