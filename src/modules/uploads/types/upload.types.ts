export interface UploadRecord {
  id: string;
  originalName: string;
  publicId: string;
  secureUrl: string;
  format: string;
  mimeType: string;
  width: number;
  height: number;
  sizeInBytes: number;
  folder: string | null;
  resourceType: string;
  ownerType: string | null;
  ownerId: string | null;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUploadRecordInput {
  originalName: string;
  publicId: string;
  secureUrl: string;
  format: string;
  mimeType: string;
  width: number;
  height: number;
  sizeInBytes: number;
  folder?: string;
  resourceType?: string;
  ownerType?: string;
  ownerId?: string;
  uploadedBy?: string;
}

export interface GetUploadTransformQuery {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "auto" | "jpg" | "png" | "webp";
  fit?: "fill" | "fit" | "scale";
}

export interface UploadListFilters {
  format: string | null;
  mimeType: string | null;
  ownerType: string | null;
  ownerId: string | null;
}

export interface ListUploadsQueryOptions {
  page: number;
  limit: number;
  filters: UploadListFilters;
}

export interface ListUploadsRepositoryResult {
  items: UploadRecord[];
  total: number;
}

export interface UploadListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListUploadsResult {
  items: UploadRecord[];
  pagination: UploadListPagination;
  filters: UploadListFilters;
}
