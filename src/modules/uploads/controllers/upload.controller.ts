import type { Request, Response } from "express";

import { AppError } from "../../../common/errors/app-error";
import { ERROR_CODES } from "../../../common/errors/error-codes";
import { sendSuccess } from "../../../common/response/api-response";
import { parseTransformQuery } from "../../../utils/validation";
import type { UploadService } from "../services/upload.service";

export class UploadController {
  public constructor(private readonly uploadService: UploadService) {}

  public createUpload = async (request: Request, response: Response): Promise<void> => {
    const upload = await this.uploadService.createUpload({
      file: request.file,
      metadata: {
        folder: request.body.folder,
        ownerType: request.body.ownerType,
        ownerId: request.body.ownerId,
        uploadedBy: request.body.uploadedBy
      }
    });

    sendSuccess({
      response,
      statusCode: 201,
      message: "Upload created successfully",
      data: upload,
      meta: {
        requestId: request.requestId
      }
    });
  };

  public listUploads = async (request: Request, response: Response): Promise<void> => {
    const { limit, uploads } = await this.uploadService.listUploads(request.query.limit);

    sendSuccess({
      response,
      statusCode: 200,
      message: "Uploads fetched successfully",
      data: uploads,
      meta: {
        requestId: request.requestId,
        count: uploads.length,
        limit,
        sort: "createdAt:desc"
      }
    });
  };

  public getUploadById = async (request: Request, response: Response): Promise<void> => {
    let transformQuery;
    try {
      transformQuery = parseTransformQuery(request.query as Record<string, unknown>);
    } catch (error) {
      throw new AppError({
        message: "Invalid transformation query parameters",
        statusCode: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: [
          { field: "query", issue: error instanceof Error ? error.message : "Invalid query" }
        ]
      });
    }

    const upload = await this.uploadService.getUploadById(request.params.id, transformQuery);
    sendSuccess({
      response,
      statusCode: 200,
      message: "Upload fetched successfully",
      data: upload,
      meta: {
        requestId: request.requestId
      }
    });
  };

  public deleteUploadById = async (request: Request, response: Response): Promise<void> => {
    const result = await this.uploadService.deleteUploadById(request.params.id);
    sendSuccess({
      response,
      statusCode: 200,
      message: "Upload deleted successfully",
      data: result,
      meta: {
        requestId: request.requestId
      }
    });
  };
}
