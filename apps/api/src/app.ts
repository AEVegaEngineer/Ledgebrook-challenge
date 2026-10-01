import express from "express";

export const app = express();

app.use(express.json());

app.get("/", (_request, response) => {
  response.json({ service: "ledgebrook-api", status: "ready" });
});
