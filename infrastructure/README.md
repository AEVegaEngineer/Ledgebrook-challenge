# Infrastructure

Local PostgreSQL lives in `../database/compose.yaml`. The root GitHub Actions workflow validates the Node.js builds, Python package, and Compose configuration.

Add application Dockerfiles, AWS ECS task definitions, blue-green or canary configuration, and observability only when a practice exercise specifically requires them. Keeping those absent now makes the starting architecture truthful and avoids speculative infrastructure.
