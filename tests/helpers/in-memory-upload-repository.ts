import { randomUUID } from "crypto";

import type {
  CreateUploadRecordInput,
  ListUploadsQueryOptions,
  ListUploadsRepositoryResult,
  UploadRecord
} from "../../src/modules/uploads/types/upload.types";
import type { UploadRepository } from "../../src/modules/uploads/repositories/upload.repository";

export class InMemoryUploadRepository implements UploadRepository {
  private records: UploadRecord[] = [];

  public async createUpload(input: CreateUploadRecordInput): Promise<UploadRecord> {
    const now = new Date();
    const record: UploadRecord = {
      id: randomUUID(),
      originalName: input.originalName,
      publicId: input.publicId,
      secureUrl: input.secureUrl,
      format: input.format,
      mimeType: input.mimeType,
      width: input.width,
      height: input.height,
      sizeInBytes: input.sizeInBytes,
      folder: input.folder ?? null,
      resourceType: input.resourceType ?? "image",
      ownerType: input.ownerType ?? null,
      ownerId: input.ownerId ?? null,
      uploadedBy: input.uploadedBy ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    this.records.push(record);
    return record;
  }

  public async findById(id: string): Promise<UploadRecord | null> {
    return this.records.find((item) => item.id === id) ?? null;
  }

  public async listByNewest(
    options: ListUploadsQueryOptions
  ): Promise<ListUploadsRepositoryResult> {
    const filteredRecords = this.records
      .filter((item) => {
        if (options.filters.format && item.format !== options.filters.format) {
          return false;
        }

        if (options.filters.mimeType && item.mimeType !== options.filters.mimeType) {
          return false;
        }

        if (options.filters.ownerType && item.ownerType !== options.filters.ownerType) {
          return false;
        }

        if (options.filters.ownerId && item.ownerId !== options.filters.ownerId) {
          return false;
        }

        return true;
      })
      .map((item, index) => ({ item, index }))
      .sort((first, second) => {
        const createdAtDifference =
          second.item.createdAt.getTime() - first.item.createdAt.getTime();

        if (createdAtDifference !== 0) {
          return createdAtDifference;
        }

        return second.index - first.index;
      })
      .map(({ item }) => item);

    const startIndex = (options.page - 1) * options.limit;
    const items = filteredRecords.slice(startIndex, startIndex + options.limit);

    return {
      items,
      total: filteredRecords.length
    };
  }

  public async deleteById(id: string): Promise<void> {
    this.records = this.records.filter((item) => item.id !== id);
  }

  public getRecords(): UploadRecord[] {
    return this.records;
  }
}
