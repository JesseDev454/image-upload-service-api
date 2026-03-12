import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
};

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return defaultValue;
  }

  return parsed;
};

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const assertNonEmpty = (value: string, key: string): void => {
  if (!value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
};

const assertPort = (value: number, key: string): void => {
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${key} must be a valid TCP port between 1 and 65535`);
  }
};

const assertPositiveInteger = (value: number, key: string): void => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
};

export interface AppEnv {
  nodeEnv: string;
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    ssl: boolean;
    synchronize: boolean;
    logging: boolean;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  upload: {
    maxFileSizeBytes: number;
    maxListLimit: number;
    defaultListLimit: number;
  };
}

export const loadEnv = (): AppEnv => {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: parseNumber(process.env.PORT, 4000),
    database: {
      host: process.env.DATABASE_HOST ?? "localhost",
      port: parseNumber(process.env.DATABASE_PORT, 5432),
      username: process.env.DATABASE_USERNAME ?? "",
      password: process.env.DATABASE_PASSWORD ?? "",
      name: process.env.DATABASE_NAME ?? "",
      ssl: parseBoolean(process.env.DATABASE_SSL, false),
      synchronize: parseBoolean(process.env.DATABASE_SYNCHRONIZE, true),
      logging: parseBoolean(process.env.DATABASE_LOGGING, false)
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
      apiKey: process.env.CLOUDINARY_API_KEY ?? "",
      apiSecret: process.env.CLOUDINARY_API_SECRET ?? ""
    },
    upload: {
      maxFileSizeBytes: parseNumber(process.env.MAX_FILE_SIZE_BYTES, 5 * 1024 * 1024),
      maxListLimit: parseNumber(process.env.MAX_LIST_LIMIT, 50),
      defaultListLimit: parseNumber(process.env.DEFAULT_LIST_LIMIT, 20)
    }
  };
};

export const env = loadEnv();

export const validateRuntimeEnv = (runtimeEnv: AppEnv): void => {
  requireEnv("CLOUDINARY_CLOUD_NAME");
  requireEnv("CLOUDINARY_API_KEY");
  requireEnv("CLOUDINARY_API_SECRET");

  assertNonEmpty(runtimeEnv.database.host, "DATABASE_HOST");
  assertPort(runtimeEnv.database.port, "DATABASE_PORT");
  assertNonEmpty(runtimeEnv.database.username, "DATABASE_USERNAME");
  assertNonEmpty(runtimeEnv.database.name, "DATABASE_NAME");

  assertPositiveInteger(runtimeEnv.upload.maxFileSizeBytes, "MAX_FILE_SIZE_BYTES");
  assertPositiveInteger(runtimeEnv.upload.maxListLimit, "MAX_LIST_LIMIT");
  assertPositiveInteger(runtimeEnv.upload.defaultListLimit, "DEFAULT_LIST_LIMIT");

  if (runtimeEnv.upload.defaultListLimit > runtimeEnv.upload.maxListLimit) {
    throw new Error("DEFAULT_LIST_LIMIT cannot be greater than MAX_LIST_LIMIT");
  }

  if (runtimeEnv.nodeEnv === "test" && !/test/i.test(runtimeEnv.database.name)) {
    throw new Error("DATABASE_NAME must include 'test' when NODE_ENV=test");
  }
};
