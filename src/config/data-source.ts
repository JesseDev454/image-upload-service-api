import "reflect-metadata";

import { DataSource } from "typeorm";

import { UploadEntity } from "../modules/uploads/entities/upload.entity";
import { env } from "./env";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  ssl: env.database.ssl ? { rejectUnauthorized: false } : false,
  synchronize: env.database.synchronize,
  logging: env.database.logging,
  entities: [UploadEntity]
});
