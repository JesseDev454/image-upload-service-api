import { Repository } from "typeorm";

import { UploadEntity } from "../entities/upload.entity";
import type {
  CreateUploadRecordInput,
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

  public async listByNewest(limit: number): Promise<UploadRecord[]> {
    return this.repository.find({
      order: {
        createdAt: "DESC"
      },
      take: limit
    });
  }

  public async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
