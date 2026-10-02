Code ChallengeTask
Implement a small underwriting decision service that exposes a REST endpoint for an internal underwriting application.
The service must evaluate an application and return a deterministic recommendation, a calculated risk summary, and human-readable reasons that could later be passed to an LLM for explanation or workflow assistance.
Inputs
Create a POST /api/underwriting/decision endpoint accepting JSON in this shape:
{
  "annualIncome": 120000,
  "monthlyDebt": 2500,
  "propertyValue": 400000,
  "requestedLoan": 280000,
  "creditScore": 720
}
Apply these rules:
Reject invalid requests with HTTP 400 and a useful validation message.
Calculate debt-to-income ratio as monthlyDebt / (annualIncome / 12).
Calculate loan-to-value ratio as requestedLoan / propertyValue.
Return DECLINE when any of the following is true:
Credit score is below 600.
Debt-to-income ratio is above 0.50.
Loan-to-value ratio is above 0.90.
Return REFER when the application is not declined but any of the following is true:
Credit score is below 680.
Debt-to-income ratio is above 0.40.
Loan-to-value ratio is above 0.80.
Otherwise return APPROVE.
For approved applications, return approvedAmount as the smaller of:
The requested loan.
80% of the property value.
Return structured reason codes and human-readable reasons for every non-ideal factor.
A successful response should have this general shape:
{
  "decision": "APPROVE",
  "approvedAmount": 280000,
  "metrics": {
    "debtToIncome": 0.25,
    "loanToValue": 0.7
  },
  "reasons": []
}
Deliverables
A working REST endpoint.
Input validation for missing, non-numeric, zero, or negative values.
A small, independently testable decision function.
At least three automated tests covering:
An approved application.
A declined application.
A referred application.
A short note describing how a React or Angular frontend would consume the endpoint and display the decision.
Use deterministic logic rather than calling a real LLM. Structure the response so an LLM explanation layer could be added later.
Constraints
The implementation must run locally in a live coding environment with one command.
Use in-memory data only; no database is required.
Do not use paid APIs or external services.
Keep business rules separate from HTTP handling.
Do not expose sensitive applicant data in logs.
Handle division-by-zero and malformed JSON safely.
Candidates may use either JavaScript or TypeScript.
A complete production-grade UI is not required; discuss the frontend integration instead.