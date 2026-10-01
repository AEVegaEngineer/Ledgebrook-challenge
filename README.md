# Ledgebrook End-to-End Practice App

This is one standalone project for the Ledgebrook Senior Full-Stack Engineer assessment. It follows the recruiter guide's recommended story:

`React frontend → Node.js/TypeScript REST API → Python worker → PostgreSQL → CI/CD`

The repository currently contains boilerplate only. There is no insurance workflow or interview-solution code yet.

## Project layout

```text
apps/
  web/       React + TypeScript + Vite
  api/       Node.js + TypeScript + Express
  worker/    Installable Python worker package
database/    Local PostgreSQL with Docker Compose
docs/        Assessment scope and architecture notes
infrastructure/ Delivery notes
```

Testing, third-party reliability, LLM safety, SQL, and system design remain practice domains, but they are applied to this one project rather than implemented as disconnected exercises.

## Prerequisites

- Node.js 20 or newer and npm 10 or newer
- Python 3.9 or newer
- Docker with Docker Compose

## Install and verify Node.js applications

From this directory:

```bash
npm install
npm run check
```

Run the applications in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

- API: <http://localhost:3000>
- Web: <http://localhost:5173>

## Install and verify the Python worker

From this directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e './apps/worker[dev]'
python -m pytest apps/worker
python -m ledgebrook_worker
```

The module exits after printing a readiness message; it does not process jobs yet.

## Start PostgreSQL

```bash
docker compose -f database/compose.yaml up -d
docker compose -f database/compose.yaml ps
```

Copy `database/.env.example` to `database/.env` only when you need to override the local defaults. Stop the database with:

```bash
docker compose -f database/compose.yaml down
```

The named volume is intentionally retained between runs. Use `down --volumes` only when you deliberately want to erase local database data.

## Practice sequence

1. Keep the boilerplate green with `npm run check` and `python -m pytest apps/worker`.
2. Implement one thin vertical slice across the existing components.
3. Add mutable-domain schema and history only when the exercise reaches PostgreSQL.
4. Add integration, provider-failure, deployment, and LLM exercises to the same application.

The detailed challenge map is in `docs/assessment-scope.md`. The initial design boundary is in `docs/system-design.md`.
