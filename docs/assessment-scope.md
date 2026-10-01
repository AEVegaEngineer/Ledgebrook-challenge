# Assessment Scope Applied to This Project

This is the exercise map from the recruiter guide. These are future practice increments, not implemented features.

## React frontend

- Deliberate ownership of local, server, and shared state.
- Loading, empty, error, retry, partial, and stale-data states.
- Request cancellation, race avoidance, accessible controls, and evidence-led performance work.

## Node.js and TypeScript API

- Simple versioned REST boundaries and runtime validation of unknown input.
- Stable errors, authorization, idempotency, transactions, audit events, and pagination.
- Event-loop behavior, bounded concurrency, timeouts, retries, cancellation, and backpressure.

## Python worker

- Typed job boundaries and dedicated processing for heavy or complex work.
- Bounded `asyncio` concurrency, per-provider timeouts, partial success, and cleanup.
- Deterministic rule evaluation kept separate from probabilistic output.

## PostgreSQL and SQL

- Normalization versus measured denormalization.
- Stable identity, immutable versions or append-only history, and current-state projections.
- Strategic JSONB, indexes, transactions, optimistic concurrency, and unique constraints.

## Testing and third-party integrations

- Unit, integration, and contract tests with explicit ownership boundaries.
- Recorded HTTP responses or controlled sandboxes outside ordinary CI.
- Timeouts, bounded retries, idempotency, circuit breaking, partial success, and reconciliation.

## CI/CD and cloud delivery

- Reproducible GitHub Actions checks, Docker, and AWS ECS concepts.
- Compatible migrations, secrets, environment separation, feature flags, and health checks.
- Blue-green or canary promotion with measurable stop and rollback signals.

## Practical LLM integration

- A narrow assistive use case with explicit non-goals and human review.
- PII minimization, access control, retention rules, structured output, provenance, and fallback.
- Offline evaluation plus productivity, acceptance or correction, and safety KPIs.

## Suggested first vertical slice

When feature practice begins, implement a minimal submission flow:

1. React sends a small validated form.
2. The Node.js API validates and persists it.
3. PostgreSQL stores current state and an auditable history.
4. The API queues optional enrichment for the Python worker.
5. The UI displays pending, completed, partial, and failed states.

Keep the first pass synchronous and local unless a stated requirement earns extra infrastructure.
