import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "File Upload + Image Processing API",
    version: "1.1.0",
    description:
      "API for uploading images, validating payloads, storing metadata, retrieving records, listing uploads with pagination and filtering, deleting uploads, and generating transformed URLs."
  },
  servers: [{ url: "http://localhost:4000", description: "Local development server" }],
  tags: [{ name: "Uploads", description: "Upload lifecycle endpoints" }],
  components: {
    schemas: {
      Upload: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          originalName: { type: "string" },
          publicId: { type: "string" },
          secureUrl: { type: "string" },
          format: { type: "string", enum: ["jpg", "jpeg", "png", "webp"] },
          mimeType: { type: "string", enum: ["image/jpeg", "image/png", "image/webp"] },
          width: { type: "number" },
          height: { type: "number" },
          sizeInBytes: { type: "number" },
          folder: { type: "string", nullable: true },
          resourceType: { type: "string" },
          ownerType: { type: "string", nullable: true },
          ownerId: { type: "string", nullable: true },
          uploadedBy: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", format: "date-time", nullable: true }
        }
      },
      UploadEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { $ref: "#/components/schemas/Upload" },
          meta: {
            type: "object",
            properties: {
              requestId: { type: "string" }
            }
          }
        }
      },
      DeleteUploadData: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          deleted: { type: "boolean", example: true }
        }
      },
      DeleteUploadEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { $ref: "#/components/schemas/DeleteUploadData" },
          meta: {
            type: "object",
            properties: {
              requestId: { type: "string" }
            }
          }
        }
      },
      UploadListFilters: {
        type: "object",
        properties: {
          format: { type: "string", nullable: true },
          mimeType: { type: "string", nullable: true },
          ownerType: { type: "string", nullable: true },
          ownerId: { type: "string", nullable: true }
        }
      },
      UploadListPagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 57 },
          totalPages: { type: "integer", example: 3 }
        }
      },
      UploadListData: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Upload" }
          },
          pagination: { $ref: "#/components/schemas/UploadListPagination" },
          filters: { $ref: "#/components/schemas/UploadListFilters" }
        }
      },
      UploadListEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { $ref: "#/components/schemas/UploadListData" },
          meta: {
            type: "object",
            properties: {
              requestId: { type: "string" }
            }
          }
        }
      },
      ErrorEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "array", items: { type: "object" } }
            }
          },
          meta: {
            type: "object",
            properties: {
              requestId: { type: "string" }
            }
          }
        }
      }
    }
  },
  paths: {
    "/api/v1/uploads": {
      post: {
        tags: ["Uploads"],
        summary: "Upload a single image",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: { type: "string", format: "binary" },
                  folder: { type: "string" },
                  ownerType: { type: "string" },
                  ownerId: { type: "string" },
                  uploadedBy: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Upload created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UploadEnvelope" }
              }
            }
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          },
          "413": {
            description: "File too large",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          },
          "415": {
            description: "Unsupported file type",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          },
          "502": {
            description: "Storage provider failure",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          }
        }
      },
      get: {
        tags: ["Uploads"],
        summary: "List uploads",
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 }
          },
          {
            name: "format",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["jpg", "jpeg", "png", "webp"] }
          },
          {
            name: "mimeType",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["image/jpeg", "image/png", "image/webp"] }
          },
          {
            name: "ownerType",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 50 }
          },
          {
            name: "ownerId",
            in: "query",
            required: false,
            schema: { type: "string", maxLength: 100 }
          }
        ],
        responses: {
          "200": {
            description: "Uploads retrieved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UploadListEnvelope" }
              }
            }
          },
          "400": {
            description: "Invalid query parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          }
        }
      }
    },
    "/api/v1/uploads/{id}": {
      get: {
        tags: ["Uploads"],
        summary: "Get upload by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" }
          },
          { name: "width", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "height", in: "query", schema: { type: "integer", minimum: 1 } },
          {
            name: "quality",
            in: "query",
            schema: { oneOf: [{ type: "integer", minimum: 1, maximum: 100 }, { type: "string" }] }
          },
          {
            name: "format",
            in: "query",
            schema: { type: "string", enum: ["auto", "jpg", "png", "webp"] }
          },
          { name: "fit", in: "query", schema: { type: "string", enum: ["fill", "fit", "scale"] } }
        ],
        responses: {
          "200": {
            description: "Upload retrieved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UploadEnvelope" }
              }
            }
          },
          "400": {
            description: "Invalid path or query parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          },
          "404": {
            description: "Upload not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Uploads"],
        summary: "Delete upload by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" }
          }
        ],
        responses: {
          "200": {
            description: "Upload deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteUploadEnvelope" }
              }
            }
          },
          "400": {
            description: "Invalid upload id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          },
          "404": {
            description: "Upload not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          },
          "502": {
            description: "Storage provider failure",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorEnvelope" }
              }
            }
          }
        }
      }
    }
  }
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
});
