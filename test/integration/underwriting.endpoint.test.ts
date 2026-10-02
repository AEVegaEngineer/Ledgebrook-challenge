import assert from "node:assert/strict";
import { describe, it } from "node:test";

import express from "express";
import request from "supertest";

import { app } from "../../src/app.js";
import { errorHandler } from "../../src/middleware/error-handler.js";

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

  it("returns a safe error when the JSON payload exceeds the request limit", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .send({ ...validApplication, padding: "x".repeat(11_000) })
      .expect("Content-Type", /json/)
      .expect(413);

    assert.deepEqual(response.body, {
      error: "PAYLOAD_TOO_LARGE",
      message: "Request body must not exceed 10 KB.",
    });
  });

  it("rejects JSON with an unsupported charset", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .set("Content-Type", "application/json; charset=iso-8859-1")
      .send(JSON.stringify(validApplication))
      .expect("Content-Type", /json/)
      .expect(415);

    assert.deepEqual(response.body, {
      error: "UNSUPPORTED_BODY_ENCODING",
      message: "Request body uses an unsupported encoding.",
    });
  });

  it("rejects JSON with an unsupported content encoding", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "snappy")
      .send(JSON.stringify(validApplication))
      .expect("Content-Type", /json/)
      .expect(415);

    assert.deepEqual(response.body, {
      error: "UNSUPPORTED_BODY_ENCODING",
      message: "Request body uses an unsupported encoding.",
    });
  });

  it("returns a safe client error for corrupted compressed JSON", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "gzip")
      .send(Buffer.from("not-gzip"))
      .expect("Content-Type", /json/)
      .expect(400);

    assert.deepEqual(response.body, {
      error: "INVALID_REQUEST_BODY",
      message: "Request body could not be processed.",
    });
  });

  it("rejects inputs that would produce a non-finite debt-to-income ratio", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .send({ ...validApplication, annualIncome: Number.MIN_VALUE })
      .expect(400);

    assert.equal(response.body.error, "VALIDATION_ERROR");
    assert.ok(
      response.body.issues.some(
        (issue: { field: string }) => issue.field === "annualIncome",
      ),
    );
  });

  it("rejects inputs that would produce a non-finite loan-to-value ratio", async () => {
    const response = await request(app)
      .post("/api/underwriting/decision")
      .send({
        ...validApplication,
        propertyValue: Number.MIN_VALUE,
        requestedLoan: Number.MAX_VALUE,
      })
      .expect(400);

    assert.equal(response.body.error, "VALIDATION_ERROR");
    assert.ok(
      response.body.issues.some(
        (issue: { field: string }) => issue.field === "propertyValue",
      ),
    );
  });

  const invalidRootValues: Array<{ name: string; body: string }> = [
    { name: "an empty body", body: "" },
    { name: "null", body: "null" },
    { name: "an array", body: "[]" },
    { name: "a primitive", body: "42" },
  ];

  for (const invalidRootValue of invalidRootValues) {
    it(`rejects ${invalidRootValue.name} safely`, async () => {
      const response = await request(app)
        .post("/api/underwriting/decision")
        .set("Content-Type", "application/json")
        .send(invalidRootValue.body)
        .expect("Content-Type", /json/)
        .expect(400);

      assert.ok(
        response.body.error === "VALIDATION_ERROR" || response.body.error === "INVALID_JSON",
      );
    });
  }

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

describe("unexpected errors", () => {
  const interruptedBodyCases = [
    {
      type: "request.aborted",
      status: 400,
      body: {
        error: "REQUEST_ABORTED",
        message: "Request body was not fully received.",
      },
    },
    {
      type: "request.size.invalid",
      status: 400,
      body: {
        error: "INVALID_CONTENT_LENGTH",
        message: "Request body size does not match the Content-Length header.",
      },
    },
  ];

  for (const interruptedBodyCase of interruptedBodyCases) {
    it(`maps ${interruptedBodyCase.type} to a safe client response`, async () => {
      const parserFailureApp = express();
      parserFailureApp.use((_request, _response, next) => {
        next({ status: interruptedBodyCase.status, type: interruptedBodyCase.type });
      });
      parserFailureApp.use(errorHandler);

      const response = await request(parserFailureApp)
        .post("/")
        .expect("Content-Type", /json/)
        .expect(interruptedBodyCase.status);

      assert.deepEqual(response.body, interruptedBodyCase.body);
    });
  }

  it("returns a generic 500 response without leaking the thrown error", async () => {
    const failingApp = express();
    failingApp.get("/failure", () => {
      throw new Error("sensitive internal details");
    });
    failingApp.use(errorHandler);

    const response = await request(failingApp)
      .get("/failure")
      .expect("Content-Type", /json/)
      .expect(500);

    assert.deepEqual(response.body, {
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    });
    assert.doesNotMatch(response.text, /sensitive internal details/);
  });
});
