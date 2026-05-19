# BRT Target Enterprise Architecture

## Technology Stack
- Frontend: React 19, TypeScript (strict), Vite, MUI, AG Grid, React Router DOM, React Hook Form, Zod, Zustand, Axios
- Backend: Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate, JWT, Flyway, OpenAPI
- Data: PostgreSQL, Redis
- DBF bridge: Python FastAPI + dbfread + pandas
- Infra: Docker, Docker Compose, NGINX, RabbitMQ

## Architecture Style
- Domain-oriented modular monolith first, event-ready for microservice split later.
- Clear bounded contexts:
  - `auth`
  - `menu`
  - `masters`
  - `transactions`
  - `ledger`
  - `reports`
  - `dbf-bridge`
  - `migration-audit`

## Runtime Components
1. `web-ui` (React SPA)
2. `api-core` (Spring Boot)
3. `dbf-bridge` (FastAPI)
4. `postgres`
5. `redis`
6. `rabbitmq`
7. `nginx` gateway

## Integration Pattern
- Synchronous business APIs via `api-core`.
- Async heavy jobs (DBF import/export, report generation, reconciliation):
  - enqueue in RabbitMQ
  - process via Spring async workers and/or FastAPI worker endpoints
  - track with `job_execution` table + Redis cache

## Non-Functional Targets
- Multi-tenant-ready schema keys (`firm_id`, `fiscal_year`).
- Query performance:
  - server-side pagination
  - selective indexes
  - aggregate materialization where needed
- High dataset UX:
  - AG Grid server-side row model
  - virtualized tables
- Security:
  - JWT + refresh strategy
  - role-based permissions from backend menus/actions
