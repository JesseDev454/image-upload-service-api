import { Router } from "express";

import { createSingleImageUploadMiddleware } from "../../../middleware/upload.middleware";
import { asyncHandler } from "../../../utils/async-handler";
import { UploadController } from "../controllers/upload.controller";
import type { UploadService } from "../services/upload.service";

interface UploadRouteOptions {
  maxFileSizeBytes: number;
}

export const createUploadRouter = (
  uploadService: UploadService,
  options: UploadRouteOptions
): Router => {
  const router = Router();
  const controller = new UploadController(uploadService);
  const singleImageUploadMiddleware = createSingleImageUploadMiddleware({
    maxFileSizeBytes: options.maxFileSizeBytes
  });

  router.post("/", singleImageUploadMiddleware, asyncHandler(controller.createUpload));
  router.get("/", asyncHandler(controller.listUploads));
  router.get("/:id", asyncHandler(controller.getUploadById));
  router.delete("/:id", asyncHandler(controller.deleteUploadById));

  return router;
};
