import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateUnderwritingDecision } from "../../src/modules/underwriting/underwriting.service.js";
import type { UnderwritingApplication } from "../../src/modules/underwriting/underwriting.types.js";

const baseApplication: UnderwritingApplication = {
  annualIncome: 120_000,
  monthlyDebt: 2_500,
  propertyValue: 400_000,
  requestedLoan: 280_000,
  creditScore: 720,
};

describe("evaluateUnderwritingDecision", () => {
  it("approves an ideal application and calculates its metrics", () => {
    const result = evaluateUnderwritingDecision(baseApplication);

    assert.deepEqual(result, {
      decision: "APPROVE",
      approvedAmount: 280_000,
      metrics: {
        debtToIncome: 0.25,
        loanToValue: 0.7,
      },
      reasons: [],
    });
  });

  it("declines when a factor crosses a decline threshold", () => {
    const result = evaluateUnderwritingDecision({
      ...baseApplication,
      creditScore: 599,
    });

    assert.equal(result.decision, "DECLINE");
    assert.equal("approvedAmount" in result, false);
    assert.deepEqual(result.reasons, [
      {
        code: "CREDIT_SCORE_DECLINE",
        message: "Credit score is below the decline threshold of 600.",
      },
    ]);
  });

  it("refers when a factor crosses only a referral threshold", () => {
    const result = evaluateUnderwritingDecision({
      ...baseApplication,
      creditScore: 650,
    });

    assert.equal(result.decision, "REFER");
    assert.equal("approvedAmount" in result, false);
    assert.deepEqual(result.reasons.map((reason) => reason.code), ["CREDIT_SCORE_REFER"]);
  });

  it("returns one severity-appropriate reason for every non-ideal factor", () => {
    const result = evaluateUnderwritingDecision({
      annualIncome: 120_000,
      monthlyDebt: 4_500,
      propertyValue: 400_000,
      requestedLoan: 340_000,
      creditScore: 590,
    });

    assert.equal(result.decision, "DECLINE");
    assert.deepEqual(result.reasons.map((reason) => reason.code), [
      "CREDIT_SCORE_DECLINE",
      "DEBT_TO_INCOME_REFER",
      "LOAN_TO_VALUE_REFER",
    ]);
  });

  it("treats the approval-side boundaries as ideal", () => {
    const result = evaluateUnderwritingDecision({
      annualIncome: 120_000,
      monthlyDebt: 4_000,
      propertyValue: 100_000,
      requestedLoan: 80_000,
      creditScore: 680,
    });

    assert.equal(result.decision, "APPROVE");
    assert.deepEqual(result.metrics, {
      debtToIncome: 0.4,
      loanToValue: 0.8,
    });
  });

  it("does not decline at the exact decline boundaries", () => {
    const result = evaluateUnderwritingDecision({
      annualIncome: 120_000,
      monthlyDebt: 5_000,
      propertyValue: 100_000,
      requestedLoan: 90_000,
      creditScore: 600,
    });

    assert.equal(result.decision, "REFER");
    assert.deepEqual(result.reasons.map((reason) => reason.code), [
      "CREDIT_SCORE_REFER",
      "DEBT_TO_INCOME_REFER",
      "LOAN_TO_VALUE_REFER",
    ]);
  });
});
