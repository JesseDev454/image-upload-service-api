import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "File Upload + Image Processing API",
    version: "1.0.0",
    description:
      "API for uploading images, validating payloads, storing metadata, retrieving records, deleting uploads, and generating transformed URLs."
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
          format: { type: "string" },
          mimeType: { type: "string" },
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
      SuccessEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { type: "object" },
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
                schema: { $ref: "#/components/schemas/SuccessEnvelope" }
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
          }
        }
      },
      get: {
        tags: ["Uploads"],
        summary: "List uploads",
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 50 }
          }
        ],
        responses: {
          "200": {
            description: "Uploads fetched",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessEnvelope" }
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
          { name: "quality", in: "query", schema: { oneOf: [{ type: "integer" }, { type: "string" }] } },
          { name: "format", in: "query", schema: { type: "string", enum: ["auto", "jpg", "png", "webp"] } },
          { name: "fit", in: "query", schema: { type: "string", enum: ["fill", "fit", "scale"] } }
        ],
        responses: {
          "200": {
            description: "Upload fetched",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessEnvelope" }
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
                schema: { $ref: "#/components/schemas/SuccessEnvelope" }
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
      }
    }
  }
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
});
