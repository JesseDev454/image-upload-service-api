import { randomUUID } from "crypto";

import { AppError } from "../../src/common/errors/app-error";
import { ERROR_CODES } from "../../src/common/errors/error-codes";
import type {
  MediaStorageProvider,
  MediaStorageUploadInput,
  MediaStorageUploadResult
} from "../../src/modules/uploads/contracts/media-storage.contract";
import type { GetUploadTransformQuery } from "../../src/modules/uploads/types/upload.types";

export class FakeCloudinaryProvider implements MediaStorageProvider {
  public shouldFailUpload = false;
  public shouldFailDelete = false;
  public uploadCallCount = 0;
  public deleteCallCount = 0;

  public async uploadImage(input: MediaStorageUploadInput): Promise<MediaStorageUploadResult> {
    this.uploadCallCount += 1;
    if (this.shouldFailUpload) {
      throw new AppError({
        message: "Simulated provider upload failure",
        statusCode: 502,
        code: ERROR_CODES.PROVIDER_ERROR
      });
    }

    let derivedFormat = "jpg";
    if (input.mimeType === "image/png") {
      derivedFormat = "png";
    } else if (input.mimeType === "image/webp") {
      derivedFormat = "webp";
    }

    return {
      publicId: input.publicId || `uploads/test/${randomUUID()}`,
      secureUrl: `https://res.cloudinary.com/demo/image/upload/v1/${input.publicId}.${derivedFormat}`,
      format: derivedFormat,
      width: 1200,
      height: 800,
      bytes: input.fileBuffer.length,
      resourceType: "image"
    };
  }

  public async deleteImage(publicId: string): Promise<void> {
    void publicId;

    this.deleteCallCount += 1;
    if (this.shouldFailDelete) {
      throw new AppError({
        message: "Simulated provider delete failure",
        statusCode: 502,
        code: ERROR_CODES.PROVIDER_ERROR
      });
    }
  }

  public buildTransformedUrl(publicId: string, options: GetUploadTransformQuery): string {
    const params = new URLSearchParams();

    if (options.width) {
      params.set("width", String(options.width));
    }
    if (options.height) {
      params.set("height", String(options.height));
    }
    if (options.quality !== undefined) {
      params.set("quality", String(options.quality));
    }
    if (options.format) {
      params.set("format", options.format);
    }
    if (options.fit) {
      params.set("fit", options.fit);
    }

    return `https://res.cloudinary.com/demo/image/upload/${publicId}?${params.toString()}`;
  }
}
