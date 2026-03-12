import type { GetUploadTransformQuery } from "../../modules/uploads/types/upload.types";

export interface UploadToCloudinaryInput {
  fileBuffer: Buffer;
  mimeType: string;
  publicId: string;
}

export interface UploadToCloudinaryResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
}

export interface CloudinaryProvider {
  uploadImage(input: UploadToCloudinaryInput): Promise<UploadToCloudinaryResult>;
  deleteImage(publicId: string): Promise<void>;
  buildTransformedUrl(publicId: string, options: GetUploadTransformQuery): string;
}
