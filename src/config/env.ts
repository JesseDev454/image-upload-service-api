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
      username: process.env.DATABASE_USERNAME ?? "postgres",
      password: process.env.DATABASE_PASSWORD ?? "postgres",
      name: process.env.DATABASE_NAME ?? "file_upload_api",
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

  if (runtimeEnv.upload.defaultListLimit > runtimeEnv.upload.maxListLimit) {
    throw new Error("DEFAULT_LIST_LIMIT cannot be greater than MAX_LIST_LIMIT");
  }
};
