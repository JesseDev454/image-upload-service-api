import { TRANSFORM_ALLOWED_FITS, TRANSFORM_ALLOWED_FORMATS } from "../config/constants";

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

const toPositiveInteger = (value: string, fieldName: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
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
