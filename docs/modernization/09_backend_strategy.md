# Backend Module Strategy (Spring Boot)

## Layering Per Module
- `controller` -> `service` -> `domain` -> `repository`
- Shared `dto` and `mapper`
- Domain events for posting and job completion

## Critical Services
- `MenuService`: dynamic menu tree by role and firm
- `PostingService`: transactional posting/reversal
- `ImportService`: idempotent DBF ingestion
- `ReconciliationService`: compares DBF and Postgres totals

## Reliability
- Audit logs for all write operations.
- Idempotency keys on import endpoints.
- Retry policies for async jobs.
