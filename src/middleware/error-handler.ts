import type { ErrorRequestHandler } from "express";

function isMalformedJsonError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next): void => {
  if (isMalformedJsonError(error)) {
    response.status(400).json({
      error: "INVALID_JSON",
      message: "Request body must be valid JSON.",
    });
    return;
  }

  response.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
  });
};
