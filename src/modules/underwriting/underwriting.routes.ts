import { Router } from "express";

import { createUnderwritingDecision } from "./underwriting.controller.js";

export const underwritingRouter = Router();

underwritingRouter.post("/decision", createUnderwritingDecision);
