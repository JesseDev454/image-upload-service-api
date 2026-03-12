import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";

import { sendSuccess } from "./common/response/api-response";
import { swaggerSpec } from "./config/swagger";
import { errorHandlerMiddleware, notFoundHandler } from "./middleware/error-handler.middleware";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { createUploadRouter } from "./modules/uploads/routes/upload.routes";
import type { UploadService } from "./modules/uploads/services/upload.service";

export interface AppDependencies {
  uploadService: UploadService;
  maxFileSizeBytes: number;
}

export const createApp = (dependencies: AppDependencies): Express => {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (request, response) => {
    sendSuccess({
      response,
      statusCode: 200,
      message: "Service is healthy",
      data: { status: "ok" },
      meta: { requestId: request.requestId }
    });
  });

  app.use(
    "/api/v1/uploads",
    createUploadRouter(dependencies.uploadService, {
      maxFileSizeBytes: dependencies.maxFileSizeBytes
    })
  );

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(notFoundHandler);
  app.use(errorHandlerMiddleware);

  return app;
};
