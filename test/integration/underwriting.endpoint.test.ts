import assert from "node:assert/strict";
import { describe, it } from "node:test";

import request from "supertest";

import { app } from "../../src/app.js";

const validApplication = {
  annualIncome: 120_000,
  monthlyDebt: 2_500,
  propertyValue: 400_000,
  requestedLoan: 280_000,
  creditScore: 720,
};

describe("POST /api/underwriting/decision", () => {
  it("returns the documented approval response", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .send({ ...validApplication, ignoredField: "not returned" })
      .expect("Content-Type", /json/)
      .expect(200);

    assert.deepEqual(response.body, {
      decision: "APPROVE",
      approvedAmount: 280_000,
      metrics: {
        debtToIncome: 0.25,
        loanToValue: 0.7,
      },
      reasons: [],
    });
  });

  const invalidCases: Array<{ name: string; body: Record<string, unknown>; field: string }> = [
    {
      name: "missing",
      body: {
        monthlyDebt: 2_500,
        propertyValue: 400_000,
        requestedLoan: 280_000,
        creditScore: 720,
      },
      field: "annualIncome",
    },
    {
      name: "non-numeric",
      body: { ...validApplication, creditScore: "excellent" },
      field: "creditScore",
    },
    {
      name: "zero",
      body: { ...validApplication, propertyValue: 0 },
      field: "propertyValue",
    },
    {
      name: "negative",
      body: { ...validApplication, monthlyDebt: -1 },
      field: "monthlyDebt",
    },
  ];

  for (const invalidCase of invalidCases) {
    it(`rejects a ${invalidCase.name} value`, async () => {
      const response = await request(app)
        .post("/api/underwriting/decision")
        .send(invalidCase.body)
        .expect("Content-Type", /json/)
        .expect(400);

      assert.equal(response.body.error, "VALIDATION_ERROR");
      assert.equal(response.body.message, "Request validation failed.");
      assert.ok(
        response.body.issues.some(
          (issue: { field: string }) => issue.field === invalidCase.field,
        ),
      );
    });
  }

  it("rejects a zero annual income before calculating debt-to-income", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .send({ ...validApplication, annualIncome: 0 })
      .expect(400);

    assert.equal(response.body.error, "VALIDATION_ERROR");
  });

  it("returns a safe error for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .set("Content-Type", "application/json")
      .send('{"annualIncome":')
      .expect("Content-Type", /json/)
      .expect(400);

    assert.deepEqual(response.body, {
      error: "INVALID_JSON",
      message: "Request body must be valid JSON.",
    });
  });

  it("omits approvedAmount from non-approved decisions", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .send({ ...validApplication, creditScore: 650 })
      .expect(200);

    assert.equal(response.body.decision, "REFER");
    assert.equal("approvedAmount" in response.body, false);
  });
});

describe("unknown routes", () => {
  it("returns a JSON 404 response", async () => {
    const response = await request(app)
      .get("/unknown")
      .expect("Content-Type", /json/)
      .expect(404);

    assert.deepEqual(response.body, {
      error: "NOT_FOUND",
      message: "Route not found.",
    });
  });
});
