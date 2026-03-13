import type {
  CreateUploadRecordInput,
  ListUploadsQueryOptions,
  ListUploadsRepositoryResult,
  UploadRecord
} from "../types/upload.types";

export interface UploadRepository {
  createUpload(input: CreateUploadRecordInput): Promise<UploadRecord>;
  findById(id: string): Promise<UploadRecord | null>;
  listByNewest(options: ListUploadsQueryOptions): Promise<ListUploadsRepositoryResult>;
  deleteById(id: string): Promise<void>;
}
