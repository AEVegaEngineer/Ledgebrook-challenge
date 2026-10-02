import express from "express";

import { errorHandler } from "./middleware/error-handler.js";
import { underwritingRouter } from "./modules/underwriting/underwriting.routes.js";

export const app = express();

app.use(express.json({ limit: "10kb" }));
app.use("/api/underwriting", underwritingRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: "NOT_FOUND",
    message: "Route not found.",
  });
});

app.use(errorHandler);
