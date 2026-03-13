import { v2 as cloudinary } from "cloudinary";

import { AppError } from "../../common/errors/app-error";
import { ERROR_CODES } from "../../common/errors/error-codes";
import { logger } from "../../common/logger";
import type {
  MediaStorageProvider,
  MediaStorageUploadInput,
  MediaStorageUploadResult
} from "../../modules/uploads/contracts/media-storage.contract";
import type { GetUploadTransformQuery } from "../../modules/uploads/types/upload.types";

interface CloudinaryProviderConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

const formatProviderError = (error: unknown): Record<string, unknown> => {
  if (error && typeof error === "object") {
    const providerError = error as {
      name?: string;
      message?: string;
      code?: string;
      http_code?: number;
      error?: {
        message?: string;
        http_code?: number;
      };
    };

    return {
      name: providerError.name,
      message: providerError.message ?? providerError.error?.message ?? "Unknown provider error",
      code: providerError.code,
      httpCode: providerError.http_code ?? providerError.error?.http_code
    };
  }

  if (!(error instanceof Error)) {
    return { message: "Unknown provider error" };
  }

  const providerError = error as Error & {
    http_code?: number;
    name?: string;
  };

  return {
    name: providerError.name,
    message: providerError.message,
    httpCode: providerError.http_code
  };
};

const fitToCropMap: Record<NonNullable<GetUploadTransformQuery["fit"]>, string> = {
  fill: "fill",
  fit: "fit",
  scale: "scale"
};

export class CloudinaryProviderAdapter implements MediaStorageProvider {
  public constructor(config: CloudinaryProviderConfig) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true
    });
  }

  public async uploadImage(input: MediaStorageUploadInput): Promise<MediaStorageUploadResult> {
    try {
      const dataUri = `data:${input.mimeType};base64,${input.fileBuffer.toString("base64")}`;
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        public_id: input.publicId,
        resource_type: "image",
        overwrite: false
      });

      return {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        resourceType: uploadResult.resource_type
      };
    } catch (error) {
      logger.error("Cloudinary upload failed", {
        error: formatProviderError(error),
        publicId: input.publicId
      });

      throw new AppError({
        message: "Failed to upload image to media provider",
        statusCode: 502,
        code: ERROR_CODES.PROVIDER_ERROR,
        cause: error
      });
    }
  }

  public async deleteImage(publicId: string): Promise<void> {
    try {
      const deleteResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true
      });

      const isSuccessful = deleteResult.result === "ok" || deleteResult.result === "not found";
      if (!isSuccessful) {
        throw new Error(`Unexpected provider delete result: ${deleteResult.result}`);
      }
    } catch (error) {
      logger.error("Cloudinary delete failed", {
        error: formatProviderError(error),
        publicId
      });

      throw new AppError({
        message: "Failed to delete image from media provider",
        statusCode: 502,
        code: ERROR_CODES.PROVIDER_ERROR,
        cause: error
      });
    }
  }

  public buildTransformedUrl(publicId: string, options: GetUploadTransformQuery): string {
    const transformation: Record<string, string | number> = {};

    if (options.width) {
      transformation.width = options.width;
    }

    if (options.height) {
      transformation.height = options.height;
    }

    if (options.fit) {
      transformation.crop = fitToCropMap[options.fit];
    }

    if (options.quality !== undefined) {
      transformation.quality = options.quality;
    }

    if (options.format !== undefined) {
      transformation.fetch_format = options.format;
    }

    return cloudinary.url(publicId, {
      secure: true,
      transformation: Object.keys(transformation).length > 0 ? [transformation] : undefined
    });
  }
}
