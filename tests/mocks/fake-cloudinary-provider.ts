import { randomUUID } from "crypto";

import { AppError } from "../../src/common/errors/app-error";
import { ERROR_CODES } from "../../src/common/errors/error-codes";
import type { GetUploadTransformQuery } from "../../src/modules/uploads/types/upload.types";
import type {
  CloudinaryProvider,
  UploadToCloudinaryInput,
  UploadToCloudinaryResult
} from "../../src/providers/cloudinary/cloudinary.types";

export class FakeCloudinaryProvider implements CloudinaryProvider {
  public shouldFailUpload = false;
  public shouldFailDelete = false;
  public uploadCallCount = 0;
  public deleteCallCount = 0;

  public async uploadImage(input: UploadToCloudinaryInput): Promise<UploadToCloudinaryResult> {
    this.uploadCallCount += 1;
    if (this.shouldFailUpload) {
      throw new AppError({
        message: "Simulated provider upload failure",
        statusCode: 502,
        code: ERROR_CODES.PROVIDER_ERROR
      });
    }

    return {
      publicId: input.publicId || `uploads/test/${randomUUID()}`,
      secureUrl: `https://res.cloudinary.com/demo/image/upload/v1/${input.publicId}.jpg`,
      format: "jpg",
      width: 1200,
      height: 800,
      bytes: input.fileBuffer.length,
      resourceType: "image"
    };
  }

  public async deleteImage(_publicId: string): Promise<void> {
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
