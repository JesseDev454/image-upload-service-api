import { randomUUID } from "crypto";

import { AppError } from "../../../common/errors/app-error";
import { ERROR_CODES } from "../../../common/errors/error-codes";
import type { AppEnv } from "../../../config/env";
import {
  isAllowedExtension,
  isAllowedMimeType,
  sanitizeFolder,
  sanitizeTextValue
} from "../../../utils/file-utils";
import {
  isUuid,
  type ParsedTransformQuery,
  parseListUploadsQuery,
  QueryValidationError
} from "../../../utils/validation";
import type {
  MediaStorageProvider,
  MediaStorageUploadResult
} from "../contracts/media-storage.contract";
import type { CreateUploadMetadataDto } from "../dto/create-upload.dto";
import type {
  CreateUploadRecordInput,
  GetUploadTransformQuery,
  ListUploadsResult,
  UploadRecord
} from "../types/upload.types";
import type { UploadRepository } from "../repositories/upload.repository";

interface CreateUploadInput {
  file?: Express.Multer.File;
  metadata: CreateUploadMetadataDto;
}

interface UploadServiceConfig {
  uploadDefaults: AppEnv["upload"];
}

export class UploadService {
  public constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly mediaStorageProvider: MediaStorageProvider,
    private readonly config: UploadServiceConfig
  ) {}

  public async createUpload(input: CreateUploadInput): Promise<UploadRecord> {
    if (!input.file) {
      throw new AppError({
        message: "No image file was provided",
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: [{ field: "image", issue: "Image file is required" }]
      });
    }

    if (!isAllowedMimeType(input.file.mimetype) || !isAllowedExtension(input.file.originalname)) {
      throw new AppError({
        message: "Unsupported file type. Allowed types: jpg, jpeg, png, webp",
        statusCode: 415,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: [{ field: "image", issue: "Unsupported mime type or extension" }]
      });
    }

    const metadata = this.parseAndValidateMetadata(input.metadata);
    const publicId = this.buildPublicId(metadata.folder);

    let cloudUpload: MediaStorageUploadResult | null = null;
    try {
      cloudUpload = await this.mediaStorageProvider.uploadImage({
        fileBuffer: input.file.buffer,
        mimeType: input.file.mimetype,
        publicId
      });

      const recordToSave: CreateUploadRecordInput = {
        originalName: this.sanitizeOriginalName(input.file.originalname),
        publicId: cloudUpload.publicId,
        secureUrl: cloudUpload.secureUrl,
        format: cloudUpload.format,
        mimeType: input.file.mimetype,
        width: cloudUpload.width,
        height: cloudUpload.height,
        sizeInBytes: cloudUpload.bytes || input.file.size,
        folder: metadata.folder,
        resourceType: cloudUpload.resourceType || "image",
        ownerType: metadata.ownerType,
        ownerId: metadata.ownerId,
        uploadedBy: metadata.uploadedBy
      };

      return await this.uploadRepository.createUpload(recordToSave);
    } catch (error) {
      if (cloudUpload?.publicId) {
        await this.mediaStorageProvider.deleteImage(cloudUpload.publicId).catch(() => undefined);
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        message: "Failed to persist upload metadata",
        statusCode: 500,
        code: ERROR_CODES.INTERNAL_ERROR,
        cause: error
      });
    }
  }

  public async listUploads(query: Record<string, unknown>): Promise<ListUploadsResult> {
    try {
      const listQuery = parseListUploadsQuery(query, {
        defaultLimit: this.config.uploadDefaults.defaultListLimit,
        maxLimit: this.config.uploadDefaults.maxListLimit
      });
      const { items, total } = await this.uploadRepository.listByNewest(listQuery);

      return {
        items,
        pagination: {
          page: listQuery.page,
          limit: listQuery.limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / listQuery.limit)
        },
        filters: listQuery.filters
      };
    } catch (error) {
      const issue =
        error instanceof QueryValidationError
          ? { field: error.field, issue: error.message }
          : {
              field: "query",
              issue: error instanceof Error ? error.message : "Invalid query parameters"
            };

      throw new AppError({
        message: "Invalid query parameter",
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: [issue]
      });
    }
  }

  public async getUploadById(
    id: string,
    transformQuery: ParsedTransformQuery
  ): Promise<
    UploadRecord & {
      transformedUrl?: string;
    }
  > {
    this.assertUuid(id);

    const uploadRecord = await this.uploadRepository.findById(id);
    if (!uploadRecord) {
      throw new AppError({
        message: "Upload not found",
        statusCode: 404,
        code: ERROR_CODES.NOT_FOUND
      });
    }

    const transformedUrl = this.buildTransformedUrl(uploadRecord.publicId, transformQuery);
    if (!transformedUrl) {
      return uploadRecord;
    }

    return {
      ...uploadRecord,
      transformedUrl
    };
  }

  public async deleteUploadById(id: string): Promise<{ id: string; deleted: true }> {
    this.assertUuid(id);

    const uploadRecord = await this.uploadRepository.findById(id);
    if (!uploadRecord) {
      throw new AppError({
        message: "Upload not found",
        statusCode: 404,
        code: ERROR_CODES.NOT_FOUND
      });
    }

    await this.mediaStorageProvider.deleteImage(uploadRecord.publicId);
    await this.uploadRepository.deleteById(id);

    return { id, deleted: true };
  }

  private parseAndValidateMetadata(metadata: CreateUploadMetadataDto): CreateUploadMetadataDto {
    try {
      const folderValue = sanitizeTextValue(metadata.folder, "folder", 120);
      const ownerTypeValue = sanitizeTextValue(metadata.ownerType, "ownerType", 50);
      const ownerIdValue = sanitizeTextValue(metadata.ownerId, "ownerId", 100);
      const uploadedByValue = sanitizeTextValue(metadata.uploadedBy, "uploadedBy", 100);

      if ((ownerTypeValue && !ownerIdValue) || (!ownerTypeValue && ownerIdValue)) {
        throw new Error("ownerType and ownerId must be provided together");
      }

      return {
        folder: sanitizeFolder(folderValue),
        ownerType: ownerTypeValue,
        ownerId: ownerIdValue,
        uploadedBy: uploadedByValue
      };
    } catch (error) {
      throw new AppError({
        message: "Invalid upload metadata",
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: [
          { field: "metadata", issue: error instanceof Error ? error.message : "Invalid metadata" }
        ]
      });
    }
  }

  private buildPublicId(folder?: string): string {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const baseFolder = folder ?? "uploads";

    return `${baseFolder}/${year}/${month}/${randomUUID()}`;
  }

  private sanitizeOriginalName(originalName: string): string {
    return originalName.replace(/[^\w.\-() ]/g, "").slice(0, 255);
  }

  private assertUuid(id: string): void {
    if (!isUuid(id)) {
      throw new AppError({
        message: "Invalid upload id",
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: [{ field: "id", issue: "id must be a valid UUID" }]
      });
    }
  }

  private buildTransformedUrl(
    publicId: string,
    transformQuery: GetUploadTransformQuery
  ): string | undefined {
    const hasTransform = Boolean(
      transformQuery.width ||
      transformQuery.height ||
      transformQuery.quality !== undefined ||
      transformQuery.format ||
      transformQuery.fit
    );

    if (!hasTransform) {
      return undefined;
    }

    return this.mediaStorageProvider.buildTransformedUrl(publicId, transformQuery);
  }
}
