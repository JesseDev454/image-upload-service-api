import { ERROR_CODES, type ErrorCode } from "./error-codes";

interface AppErrorOptions {
  message: string;
  statusCode: number;
  code: ErrorCode;
  details?: unknown;
  cause?: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly cause?: unknown;

  public constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    this.cause = options.cause;
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError({
    message: "Unexpected server error",
    statusCode: 500,
    code: ERROR_CODES.INTERNAL_ERROR,
    cause: error
  });
};
