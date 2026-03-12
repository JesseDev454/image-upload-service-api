import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import { AppError, isAppError, toAppError } from "../common/errors/app-error";
import { ERROR_CODES } from "../common/errors/error-codes";
import { logger } from "../common/logger";
import { sendError } from "../common/response/api-response";

const formatUnknownError = (error: AppError): Record<string, unknown> => {
  return {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode
  };
};

export const errorHandlerMiddleware = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    sendError({
      response,
      statusCode: 413,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "File size exceeds the allowed limit",
      details: [{ field: "image", issue: "File too large" }],
      meta: { requestId: request.requestId }
    });
    return;
  }

  if (isAppError(error)) {
    sendError({
      response,
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
      meta: { requestId: request.requestId }
    });
    return;
  }

  const appError = toAppError(error);
  logger.error("Unhandled application error", {
    requestId: request.requestId,
    error: formatUnknownError(appError)
  });

  sendError({
    response,
    statusCode: 500,
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "Unexpected server error",
    meta: { requestId: request.requestId }
  });
};

export const notFoundHandler = (request: Request, _response: Response, next: NextFunction): void => {
  next(
    new AppError({
      message: `Route not found: ${request.method} ${request.originalUrl}`,
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND
    })
  );
};
