# Incremental and Safe Migration Strategy

## Core Principles
- Legacy FoxPro outputs remain benchmark of functional parity.
- Parallel-run phase before cutover.
- No big-bang replacement.
- Every migrated workflow has:
  - parity test data set
  - reconciliation report
  - rollback strategy

## Phase Plan
1. Discovery and Contracts
- Extract PRG workflow contracts to a parity matrix.
- Freeze DBF schemas used by active workflows.
- Define canonical PostgreSQL schema + mapping rules.

2. Foundation
- Stand up Spring Boot + Postgres + Redis + RabbitMQ.
- Implement auth, role, menu configuration APIs.
- Create dynamic menu tables and permission model.

3. Master Data Migration
- Migrate customer/supplier/item masters.
- Build DBF import jobs (idempotent upserts).
- Build DBF export compatibility endpoints.

4. Transaction Migration
- Migrate inward/outward/challan/billing flows.
- Implement posting/reversal with audit trails.
- Run dual-write or scheduled sync during transition.

5. Reports and Print Migration
- Convert report parameter contracts and templates.
- Preserve print layouts and numbering behavior.

6. Parallel Run and Cutover
- Daily reconciliation of totals, balances, pending docs.
- User acceptance by module.
- Cutover per module, not whole system.

## Backward Compatibility Controls
- Keep DBF export format stable for downstream dependencies.
- Introduce `legacy_ref_no`, `legacy_table`, `legacy_row_hash` on migrated tables.
- Maintain transformation logs for each import batch.
