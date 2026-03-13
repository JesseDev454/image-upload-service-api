import type { Repository } from "typeorm";

import type { UploadEntity } from "../entities/upload.entity";
import type {
  CreateUploadRecordInput,
  ListUploadsQueryOptions,
  ListUploadsRepositoryResult,
  UploadRecord
} from "../types/upload.types";
import type { UploadRepository } from "./upload.repository";

export class TypeOrmUploadRepository implements UploadRepository {
  public constructor(private readonly repository: Repository<UploadEntity>) {}

  public async createUpload(input: CreateUploadRecordInput): Promise<UploadRecord> {
    const entity = this.repository.create({
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
      deletedAt: null
    });

    return this.repository.save(entity);
  }

  public async findById(id: string): Promise<UploadRecord | null> {
    return this.repository.findOne({
      where: { id }
    });
  }

  public async listByNewest(
    options: ListUploadsQueryOptions
  ): Promise<ListUploadsRepositoryResult> {
    const queryBuilder = this.repository.createQueryBuilder("upload");

    if (options.filters.format) {
      queryBuilder.andWhere("upload.format = :format", { format: options.filters.format });
    }

    if (options.filters.mimeType) {
      queryBuilder.andWhere("upload.mimeType = :mimeType", {
        mimeType: options.filters.mimeType
      });
    }

    if (options.filters.ownerType) {
      queryBuilder.andWhere("upload.ownerType = :ownerType", {
        ownerType: options.filters.ownerType
      });
    }

    if (options.filters.ownerId) {
      queryBuilder.andWhere("upload.ownerId = :ownerId", { ownerId: options.filters.ownerId });
    }

    const [items, total] = await queryBuilder
      .orderBy("upload.createdAt", "DESC")
      .addOrderBy("upload.id", "DESC")
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return { items, total };
  }

  public async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
