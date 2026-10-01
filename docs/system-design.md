# System-Design Practice Boundary

Design one submission-to-decision workflow around this project. Brokers submit mutable information and documents. Third-party enrichment may be slow or unavailable. Internal reviewers need a fast current view, complete history, manual overrides, and safe concurrent edits. An optional LLM may summarize approved source material but cannot make a final decision.

Practice in this order:

1. Clarify actors, workflow, scale, latency, consistency, privacy, auditability, and failure tolerance.
2. State the core invariants.
3. Draw the smallest end-to-end path using the existing web, API, worker, and database boundaries.
4. Define key contracts and data ownership.
5. Trace the happy path and at least two failure paths.
6. Add queues, caches, services, projections, or LLM infrastructure only when a requirement earns them.
7. Close with tests, observability, deployment, rollback, the main tradeoff, and one known limitation.
