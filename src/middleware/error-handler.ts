import type { ErrorRequestHandler } from "express";
import { z } from "zod";

const requestClientErrorSchema = z
  .object({
    status: z.number().int().min(400).max(499),
    type: z.string().optional(),
  })
  .passthrough();

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next): void => {
  const clientError = requestClientErrorSchema.safeParse(error);

  if (clientError.success && clientError.data.type === "entity.parse.failed") {
    response.status(400).json({
      error: "INVALID_JSON",
      message: "Request body must be valid JSON.",
    });
    return;
  }

  if (clientError.success && clientError.data.type === "entity.too.large") {
    response.status(413).json({
      error: "PAYLOAD_TOO_LARGE",
      message: "Request body must not exceed 10 KB.",
    });
    return;
  }

  if (
    clientError.success &&
    (clientError.data.type === "charset.unsupported" ||
      clientError.data.type === "encoding.unsupported")
  ) {
    response.status(415).json({
      error: "UNSUPPORTED_BODY_ENCODING",
      message: "Request body uses an unsupported encoding.",
    });
    return;
  }

  if (clientError.success && clientError.data.type === "request.aborted") {
    response.status(400).json({
      error: "REQUEST_ABORTED",
      message: "Request body was not fully received.",
    });
    return;
  }

  if (clientError.success && clientError.data.type === "request.size.invalid") {
    response.status(400).json({
      error: "INVALID_CONTENT_LENGTH",
      message: "Request body size does not match the Content-Length header.",
    });
    return;
  }

  if (clientError.success) {
    response.status(clientError.data.status).json({
      error: "INVALID_REQUEST_BODY",
      message: "Request body could not be processed.",
    });
    return;
  }

  response.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
  });
};
