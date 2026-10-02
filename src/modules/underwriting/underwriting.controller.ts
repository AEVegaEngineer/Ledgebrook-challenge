import type { Request, Response } from "express";

import { underwritingApplicationSchema } from "./underwriting.schema.js";
import { evaluateUnderwritingDecision } from "./underwriting.service.js";

interface ValidationIssue {
  field: string;
  message: string;
}

export function createUnderwritingDecision(request: Request, response: Response): void {
  const requestBody: unknown = request.body;
  const parsedRequest = underwritingApplicationSchema.safeParse(requestBody);

  if (!parsedRequest.success) {
    const issues: ValidationIssue[] = parsedRequest.error.issues.map((issue) => ({
      field: issue.path.join(".") || "request",
      message: issue.message,
    }));

    response.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Request validation failed.",
      issues,
    });
    return;
  }

  response.status(200).json(evaluateUnderwritingDecision(parsedRequest.data));
}
