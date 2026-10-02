export type UnderwritingDecision = "APPROVE" | "REFER" | "DECLINE";

export type UnderwritingReasonCode =
  | "CREDIT_SCORE_DECLINE"
  | "DEBT_TO_INCOME_DECLINE"
  | "LOAN_TO_VALUE_DECLINE"
  | "CREDIT_SCORE_REFER"
  | "DEBT_TO_INCOME_REFER"
  | "LOAN_TO_VALUE_REFER";

export interface UnderwritingApplication {
  annualIncome: number;
  monthlyDebt: number;
  propertyValue: number;
  requestedLoan: number;
  creditScore: number;
}

export interface UnderwritingMetrics {
  debtToIncome: number;
  loanToValue: number;
}

export interface UnderwritingReason {
  code: UnderwritingReasonCode;
  message: string;
}

interface BaseUnderwritingResult {
  decision: UnderwritingDecision;
  metrics: UnderwritingMetrics;
  reasons: UnderwritingReason[];
}

export interface ApprovedUnderwritingResult extends BaseUnderwritingResult {
  decision: "APPROVE";
  approvedAmount: number;
}

export interface NonApprovedUnderwritingResult extends BaseUnderwritingResult {
  decision: "REFER" | "DECLINE";
}

export type UnderwritingResult =
  | ApprovedUnderwritingResult
  | NonApprovedUnderwritingResult;
