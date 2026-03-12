import "reflect-metadata";

import { createApp } from "./app";
import { logger } from "./common/logger";
import { AppDataSource } from "./config/data-source";
import { env, validateRuntimeEnv } from "./config/env";
import { UploadEntity } from "./modules/uploads/entities/upload.entity";
import { TypeOrmUploadRepository } from "./modules/uploads/repositories/typeorm-upload.repository";
import { UploadService } from "./modules/uploads/services/upload.service";
import { CloudinaryProviderAdapter } from "./providers/cloudinary/cloudinary.provider";

const bootstrap = async (): Promise<void> => {
  validateRuntimeEnv(env);

  await AppDataSource.initialize();
  logger.info("Database connection initialized");

  const uploadRepository = new TypeOrmUploadRepository(AppDataSource.getRepository(UploadEntity));
  const cloudinaryProvider = new CloudinaryProviderAdapter({
    cloudName: env.cloudinary.cloudName,
    apiKey: env.cloudinary.apiKey,
    apiSecret: env.cloudinary.apiSecret
  });
  const uploadService = new UploadService(uploadRepository, cloudinaryProvider, {
    uploadDefaults: env.upload
  });

  const app = createApp({
    uploadService,
    maxFileSizeBytes: env.upload.maxFileSizeBytes
  });

  app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`);
  });
};

void bootstrap().catch((error) => {
  logger.error("Failed to bootstrap application", {
    error: error instanceof Error ? error.message : "Unknown error"
  });
  process.exit(1);
});
