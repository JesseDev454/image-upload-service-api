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

const isMalformedMultipartError = (error: unknown): error is Error => {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Multipart: Boundary not found") ||
    error.message.includes("Unexpected end of form") ||
    error.message.includes("Malformed part header")
  );
};

const getMulterValidationPayload = (
  error: multer.MulterError
): {
  statusCode: number;
  message: string;
  details: Array<{ field: string; issue: string }>;
} => {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return {
        statusCode: 413,
        message: "File size exceeds the allowed limit",
        details: [{ field: error.field ?? "image", issue: "File too large" }]
      };
    case "LIMIT_UNEXPECTED_FILE":
      return {
        statusCode: 400,
        message: "Unexpected file field in multipart request",
        details: [
          {
            field: error.field ?? "image",
            issue: "Only one file is allowed in the `image` field"
          }
        ]
      };
    default:
      return {
        statusCode: 400,
        message: "Multipart request validation failed",
        details: [
          {
            field: "request",
            issue: error.message
          }
        ]
      };
  }
};

export const errorHandlerMiddleware = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  void _next;

  if (error instanceof multer.MulterError) {
    const normalizedError = getMulterValidationPayload(error);
    sendError({
      response,
      statusCode: normalizedError.statusCode,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: normalizedError.message,
      details: normalizedError.details,
      meta: { requestId: request.requestId }
    });
    return;
  }

  if (isMalformedMultipartError(error)) {
    sendError({
      response,
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Malformed multipart/form-data request",
      details: [{ field: "request", issue: error.message }],
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

export const notFoundHandler = (
  request: Request,
  _response: Response,
  next: NextFunction
): void => {
  next(
    new AppError({
      message: `Route not found: ${request.method} ${request.originalUrl}`,
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND
    })
  );
};
