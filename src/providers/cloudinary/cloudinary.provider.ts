import { v2 as cloudinary } from "cloudinary";

import { AppError } from "../../common/errors/app-error";
import { ERROR_CODES } from "../../common/errors/error-codes";
import type { GetUploadTransformQuery } from "../../modules/uploads/types/upload.types";
import type {
  CloudinaryProvider,
  UploadToCloudinaryInput,
  UploadToCloudinaryResult
} from "./cloudinary.types";

interface CloudinaryProviderConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

const fitToCropMap: Record<NonNullable<GetUploadTransformQuery["fit"]>, string> = {
  fill: "fill",
  fit: "fit",
  scale: "scale"
};

export class CloudinaryProviderAdapter implements CloudinaryProvider {
  public constructor(config: CloudinaryProviderConfig) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true
    });
  }

  public async uploadImage(input: UploadToCloudinaryInput): Promise<UploadToCloudinaryResult> {
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
