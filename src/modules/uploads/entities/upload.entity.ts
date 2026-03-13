import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity({ name: "uploads" })
@Index("idx_uploads_created_at", ["createdAt"])
@Index("idx_uploads_format", ["format"])
@Index("idx_uploads_mime_type", ["mimeType"])
@Index("idx_uploads_owner", ["ownerType", "ownerId"])
@Index("idx_uploads_folder", ["folder"])
export class UploadEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  originalName!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  publicId!: string;

  @Column({ type: "text" })
  secureUrl!: string;

  @Column({ type: "varchar", length: 20 })
  format!: string;

  @Column({ type: "varchar", length: 100 })
  mimeType!: string;

  @Column({ type: "integer" })
  width!: number;

  @Column({ type: "integer" })
  height!: number;

  @Column({ type: "integer" })
  sizeInBytes!: number;

  @Column({ type: "varchar", length: 120, nullable: true })
  folder!: string | null;

  @Column({ type: "varchar", length: 20, default: "image" })
  resourceType!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  ownerType!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  ownerId!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  uploadedBy!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  deletedAt!: Date | null;
}
