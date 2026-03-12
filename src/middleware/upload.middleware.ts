import multer from "multer";
import type { RequestHandler } from "express";

import { ERROR_CODES } from "../common/errors/error-codes";
import { AppError } from "../common/errors/app-error";
import { isAllowedExtension, isAllowedMimeType } from "../utils/file-utils";

interface UploadMiddlewareConfig {
  maxFileSizeBytes: number;
}

export const createSingleImageUploadMiddleware = (
  config: UploadMiddlewareConfig
): RequestHandler => {
  const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: config.maxFileSizeBytes,
      files: 1
    },
    fileFilter: (_request, file, callback) => {
      const mimeAllowed = isAllowedMimeType(file.mimetype);
      const extensionAllowed = isAllowedExtension(file.originalname);

      if (!mimeAllowed || !extensionAllowed) {
        callback(
          new AppError({
            message: "Unsupported file type. Allowed types: jpg, jpeg, png, webp",
            statusCode: 415,
            code: ERROR_CODES.VALIDATION_ERROR,
            details: [
              {
                field: "image",
                issue: "Unsupported mime type or extension"
              }
            ]
          })
        );
        return;
      }

      callback(null, true);
    }
  });

  return uploader.single("image");
};
