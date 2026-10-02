import type {
  UnderwritingApplication,
  UnderwritingMetrics,
  UnderwritingReason,
  UnderwritingResult,
} from "./underwriting.types.js";

const CREDIT_SCORE_DECLINE_THRESHOLD = 600;
const CREDIT_SCORE_REFER_THRESHOLD = 680;
const DEBT_TO_INCOME_DECLINE_THRESHOLD = 0.5;
const DEBT_TO_INCOME_REFER_THRESHOLD = 0.4;
const LOAN_TO_VALUE_DECLINE_THRESHOLD = 0.9;
const LOAN_TO_VALUE_REFER_THRESHOLD = 0.8;
const APPROVAL_LOAN_TO_VALUE_LIMIT = 0.8;

function formatRatioThreshold(value: number): string {
  return value.toFixed(2);
}

interface FactorEvaluation {
  reason?: UnderwritingReason;
  declines: boolean;
}

function calculateMetrics(application: UnderwritingApplication): UnderwritingMetrics {
  return {
    debtToIncome: application.monthlyDebt / (application.annualIncome / 12),
    loanToValue: application.requestedLoan / application.propertyValue,
  };
}

function evaluateCreditScore(creditScore: number): FactorEvaluation {
  if (creditScore < CREDIT_SCORE_DECLINE_THRESHOLD) {
    return {
      reason: {
        code: "CREDIT_SCORE_DECLINE",
        message: `Credit score is below the decline threshold of ${CREDIT_SCORE_DECLINE_THRESHOLD}.`,
      },
      declines: true,
    };
  }

  if (creditScore < CREDIT_SCORE_REFER_THRESHOLD) {
    return {
      reason: {
        code: "CREDIT_SCORE_REFER",
        message: `Credit score is below the referral threshold of ${CREDIT_SCORE_REFER_THRESHOLD}.`,
      },
      declines: false,
    };
  }

  return { declines: false };
}

function evaluateDebtToIncome(debtToIncome: number): FactorEvaluation {
  if (debtToIncome > DEBT_TO_INCOME_DECLINE_THRESHOLD) {
    return {
      reason: {
        code: "DEBT_TO_INCOME_DECLINE",
        message: `Debt-to-income ratio is above the decline threshold of ${formatRatioThreshold(DEBT_TO_INCOME_DECLINE_THRESHOLD)}.`,
      },
      declines: true,
    };
  }

  if (debtToIncome > DEBT_TO_INCOME_REFER_THRESHOLD) {
    return {
      reason: {
        code: "DEBT_TO_INCOME_REFER",
        message: `Debt-to-income ratio is above the referral threshold of ${formatRatioThreshold(DEBT_TO_INCOME_REFER_THRESHOLD)}.`,
      },
      declines: false,
    };
  }

  return { declines: false };
}

function evaluateLoanToValue(loanToValue: number): FactorEvaluation {
  if (loanToValue > LOAN_TO_VALUE_DECLINE_THRESHOLD) {
    return {
      reason: {
        code: "LOAN_TO_VALUE_DECLINE",
        message: `Loan-to-value ratio is above the decline threshold of ${formatRatioThreshold(LOAN_TO_VALUE_DECLINE_THRESHOLD)}.`,
      },
      declines: true,
    };
  }

  if (loanToValue > LOAN_TO_VALUE_REFER_THRESHOLD) {
    return {
      reason: {
        code: "LOAN_TO_VALUE_REFER",
        message: `Loan-to-value ratio is above the referral threshold of ${formatRatioThreshold(LOAN_TO_VALUE_REFER_THRESHOLD)}.`,
      },
      declines: false,
    };
  }

  return { declines: false };
}

export function evaluateUnderwritingDecision(
  application: UnderwritingApplication,
): UnderwritingResult {
  const metrics = calculateMetrics(application);
  const factorEvaluations = [
    evaluateCreditScore(application.creditScore),
    evaluateDebtToIncome(metrics.debtToIncome),
    evaluateLoanToValue(metrics.loanToValue),
  ];
  const reasons = factorEvaluations.flatMap((evaluation) =>
    evaluation.reason === undefined ? [] : [evaluation.reason],
  );

  if (factorEvaluations.some((evaluation) => evaluation.declines)) {
    return { decision: "DECLINE", metrics, reasons };
  }

  if (reasons.length > 0) {
    return { decision: "REFER", metrics, reasons };
  }

  return {
    decision: "APPROVE",
    approvedAmount: Math.min(
      application.requestedLoan,
      application.propertyValue * APPROVAL_LOAN_TO_VALUE_LIMIT,
    ),
    metrics,
    reasons,
  };
}
