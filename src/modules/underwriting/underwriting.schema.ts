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
  .strip();
