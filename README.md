# Underwriting Decision Service

A small TypeScript and Express REST service that evaluates underwriting applications with deterministic business rules. It runs entirely in memory and keeps HTTP handling, runtime validation, and decision logic in separate modules.

## Requirements

- Node.js 20 or newer (`.nvmrc` selects Node.js 22)
- npm 10 or newer

## Run locally

Install dependencies and start the watch-mode development server:

```bash
npm install
npm run dev
```

The service listens on `http://localhost:3000` by default. Set `PORT` to use another valid port.

## API

### `POST /api/underwriting/decision`

Example request:

```bash
curl --request POST http://localhost:3000/api/underwriting/decision \
  --header 'Content-Type: application/json' \
  --data '{
    "annualIncome": 120000,
    "monthlyDebt": 2500,
    "propertyValue": 400000,
    "requestedLoan": 280000,
    "creditScore": 720
  }'
```

Example response:

```json
{
  "decision": "APPROVE",
  "approvedAmount": 280000,
  "metrics": {
    "debtToIncome": 0.25,
    "loanToValue": 0.7
  },
  "reasons": []
}
```

Valid requests return `APPROVE`, `REFER`, or `DECLINE`. `approvedAmount` is present only for approved applications. Every non-ideal factor is represented as a stable reason code paired with a human-readable message.

All five input fields are required and must be finite numbers greater than zero. Validation failures return HTTP 400:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "issues": [
    {
      "field": "annualIncome",
      "message": "Annual income must be greater than zero."
    }
  ]
}
```

Malformed JSON also returns HTTP 400 with the `INVALID_JSON` error code.

## Project structure

```text
src/
├── app.ts
├── server.ts
├── middleware/
│   └── error-handler.ts
└── modules/
    └── underwriting/
        ├── underwriting.types.ts
        ├── underwriting.schema.ts
        ├── underwriting.service.ts
        ├── underwriting.controller.ts
        └── underwriting.routes.ts
test/
├── unit/
│   └── underwriting.service.test.ts
└── integration/
    └── underwriting.endpoint.test.ts
```

The underwriting service is a pure function with no Express or validation dependencies. Zod validates unknown request data at the HTTP boundary, and the controller passes only parsed domain input to the service. There is no database, external provider, or LLM dependency.

## Commands

```bash
npm run dev        # Start the development server in watch mode
npm test           # Run unit and integration tests
npm run typecheck  # Check TypeScript types
npm run build      # Compile to dist/
npm start          # Run the compiled service
npm run check      # Typecheck, test, and build
```

## Test with Postman

Start the backend with `npm run dev`, then import [`postman/underwriting-decision-service.postman_collection.json`](postman/underwriting-decision-service.postman_collection.json) into Postman. Run individual requests or use Postman's collection runner to exercise all decision, boundary, validation, malformed JSON, and routing cases with built-in assertions.

The collection uses a `baseUrl` variable set to `http://localhost:3000`. Update that collection variable if the service is running on another host or port.

## Frontend integration

A React or Angular client would collect the five numeric fields in a form and submit them as JSON when the user requests a decision. While the request is pending, it should disable duplicate submissions and show a loading state. HTTP 400 validation issues can be mapped to their matching form controls, while malformed or unexpected errors should be shown as a general message with a retry action.

On success, the client should render the decision as a prominent status, format DTI and LTV as percentages, show `approvedAmount` only for approvals, and list each human-readable reason for referred or declined applications. The stable reason codes can later support analytics, workflow routing, or an optional LLM explanation layer without giving an LLM authority over the decision.
