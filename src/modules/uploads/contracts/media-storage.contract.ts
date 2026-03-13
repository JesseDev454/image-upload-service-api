import type { GetUploadTransformQuery } from "../types/upload.types";

export interface MediaStorageUploadInput {
  fileBuffer: Buffer;
  mimeType: string;
  publicId: string;
}

export interface MediaStorageUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
}

export interface MediaStorageProvider {
  uploadImage(input: MediaStorageUploadInput): Promise<MediaStorageUploadResult>;
  deleteImage(publicId: string): Promise<void>;
  buildTransformedUrl(publicId: string, options: GetUploadTransformQuery): string;
}
