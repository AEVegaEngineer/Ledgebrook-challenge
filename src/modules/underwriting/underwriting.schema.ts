import { z } from "zod";

import type { UnderwritingApplication } from "./underwriting.types.js";

function positiveNumber(fieldName: string): z.ZodNumber {
  return z
    .number({ error: `${fieldName} must be a number.` })
    .finite(`${fieldName} must be finite.`)
    .positive(`${fieldName} must be greater than zero.`);
}

export const underwritingApplicationSchema: z.ZodType<UnderwritingApplication> = z
  .object({
    annualIncome: positiveNumber("Annual income"),
    monthlyDebt: positiveNumber("Monthly debt"),
    propertyValue: positiveNumber("Property value"),
    requestedLoan: positiveNumber("Requested loan"),
    creditScore: positiveNumber("Credit score"),
  })
  .strip()
  .superRefine((application, context) => {
    const monthlyIncome = application.annualIncome / 12;
    const debtToIncome = application.monthlyDebt / monthlyIncome;
    const loanToValue = application.requestedLoan / application.propertyValue;

    if (monthlyIncome === 0 || !Number.isFinite(debtToIncome)) {
      context.addIssue({
        code: "custom",
        path: ["annualIncome"],
        message: "Annual income and monthly debt must produce a finite debt-to-income ratio.",
      });
    }

    if (!Number.isFinite(loanToValue)) {
      context.addIssue({
        code: "custom",
        path: ["propertyValue"],
        message: "Property value and requested loan must produce a finite loan-to-value ratio.",
      });
    }
  });
