import path from "path";

import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from "../config/constants";

export const getFileExtension = (fileName: string): string => {
  return path.extname(fileName).toLowerCase();
};

export const isAllowedMimeType = (mimeType: string): boolean => {
  return ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number]);
};

export const isAllowedExtension = (fileName: string): boolean => {
  return ALLOWED_EXTENSIONS.includes(
    getFileExtension(fileName) as (typeof ALLOWED_EXTENSIONS)[number]
  );
};

export const sanitizeTextValue = (
  value: unknown,
  fieldName: string,
  maxLength = 120
): string | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} cannot exceed ${maxLength} characters`);
  }

  return trimmed;
};

export const sanitizeFolder = (folder?: string): string | undefined => {
  if (!folder) {
    return undefined;
  }

  const normalized = folder
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join("/");

  return normalized || undefined;
};
