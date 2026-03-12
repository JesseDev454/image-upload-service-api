import type {
  CreateUploadRecordInput,
  UploadRecord
} from "../types/upload.types";

export interface UploadRepository {
  createUpload(input: CreateUploadRecordInput): Promise<UploadRecord>;
  findById(id: string): Promise<UploadRecord | null>;
  listByNewest(limit: number): Promise<UploadRecord[]>;
  deleteById(id: string): Promise<void>;
}
