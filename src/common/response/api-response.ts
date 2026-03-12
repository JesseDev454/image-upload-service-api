import type { Response } from "express";

interface ResponseMeta {
  requestId?: string;
  [key: string]: unknown;
}

interface SuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: ResponseMeta;
}

interface SendSuccessParams<T> {
  response: Response;
  statusCode: number;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

interface SendErrorParams {
  response: Response;
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  meta?: ResponseMeta;
}

export const sendSuccess = <T>({
  response,
  statusCode,
  message,
  data,
  meta
}: SendSuccessParams<T>): Response<SuccessEnvelope<T>> => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {})
  });
};

export const sendError = ({
  response,
  statusCode,
  code,
  message,
  details,
  meta
}: SendErrorParams): Response<ErrorEnvelope> => {
  return response.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {})
    },
    ...(meta ? { meta } : {})
  });
};
