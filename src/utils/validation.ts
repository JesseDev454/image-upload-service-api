import {
  ALLOWED_MIME_TYPES,
  LIST_ALLOWED_FORMAT_FILTERS,
  TRANSFORM_ALLOWED_FITS,
  TRANSFORM_ALLOWED_FORMATS
} from "../config/constants";
import type { ListUploadsQueryOptions } from "../modules/uploads/types/upload.types";
import { sanitizeTextValue } from "./file-utils";

export const isUuid = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export interface ParsedTransformQuery {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "auto" | "jpg" | "png" | "webp";
  fit?: "fill" | "fit" | "scale";
}

export class QueryValidationError extends Error {
  public constructor(
    public readonly field: string,
    message: string
  ) {
    super(message);
    this.name = "QueryValidationError";
  }
}

const toPositiveInteger = (value: string, fieldName: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }

  return parsed;
};

const parsePositiveIntegerQueryValue = (
  value: unknown,
  fieldName: string,
  defaultValue: number,
  maxValue?: number
): number => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new QueryValidationError(fieldName, `${fieldName} must be a positive integer`);
  }

  if (maxValue !== undefined && parsed > maxValue) {
    throw new QueryValidationError(fieldName, `${fieldName} cannot be greater than ${maxValue}`);
  }

  return parsed;
};

export const parseTransformQuery = (query: Record<string, unknown>): ParsedTransformQuery => {
  const parsed: ParsedTransformQuery = {};

  if (query.width !== undefined) {
    parsed.width = toPositiveInteger(String(query.width), "width");
  }

  if (query.height !== undefined) {
    parsed.height = toPositiveInteger(String(query.height), "height");
  }

  if (query.quality !== undefined) {
    const quality = String(query.quality).toLowerCase();
    if (quality === "auto") {
      parsed.quality = "auto";
    } else {
      const qualityNumber = toPositiveInteger(quality, "quality");
      if (qualityNumber > 100) {
        throw new Error("quality must be between 1 and 100 or auto");
      }
      parsed.quality = qualityNumber;
    }
  }

  if (query.format !== undefined) {
    const format = String(query.format).toLowerCase();
    if (!TRANSFORM_ALLOWED_FORMATS.includes(format as (typeof TRANSFORM_ALLOWED_FORMATS)[number])) {
      throw new Error(`format must be one of: ${TRANSFORM_ALLOWED_FORMATS.join(", ")}`);
    }
    parsed.format = format as ParsedTransformQuery["format"];
  }

  if (query.fit !== undefined) {
    const fit = String(query.fit).toLowerCase();
    if (!TRANSFORM_ALLOWED_FITS.includes(fit as (typeof TRANSFORM_ALLOWED_FITS)[number])) {
      throw new Error(`fit must be one of: ${TRANSFORM_ALLOWED_FITS.join(", ")}`);
    }
    parsed.fit = fit as ParsedTransformQuery["fit"];
  }

  return parsed;
};

export const parseListLimit = (value: unknown, defaultLimit: number, maxLimit: number): number => {
  if (value === undefined || value === null || value === "") {
    return defaultLimit;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("limit must be a positive integer");
  }

  return Math.min(parsed, maxLimit);
};

export const parseListUploadsQuery = (
  query: Record<string, unknown>,
  defaults: {
    defaultLimit: number;
    maxLimit: number;
  }
): ListUploadsQueryOptions => {
  const page = parsePositiveIntegerQueryValue(query.page, "page", 1);
  const limit = parsePositiveIntegerQueryValue(
    query.limit,
    "limit",
    defaults.defaultLimit,
    defaults.maxLimit
  );

  const format = sanitizeTextValue(query.format, "format", 20)?.toLowerCase();
  if (
    format &&
    !LIST_ALLOWED_FORMAT_FILTERS.includes(format as (typeof LIST_ALLOWED_FORMAT_FILTERS)[number])
  ) {
    throw new QueryValidationError(
      "format",
      `format must be one of: ${LIST_ALLOWED_FORMAT_FILTERS.join(", ")}`
    );
  }

  const mimeType = sanitizeTextValue(query.mimeType, "mimeType", 100)?.toLowerCase();
  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new QueryValidationError(
      "mimeType",
      `mimeType must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }

  const ownerType = sanitizeTextValue(query.ownerType, "ownerType", 50) ?? null;
  const ownerId = sanitizeTextValue(query.ownerId, "ownerId", 100) ?? null;

  return {
    page,
    limit,
    filters: {
      format: format ?? null,
      mimeType: mimeType ?? null,
      ownerType,
      ownerId
    }
  };
};
