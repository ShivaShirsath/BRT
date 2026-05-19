# PostgreSQL and Indexing Strategy

## Schema Layers
- `core`: auth, menu, role, firm
- `master`: customers, suppliers, items, vehicles
- `txn`: challans, inward, outward, bills, patti
- `ledger`: gl_entries, stock_ledger
- `mig`: import_batch, import_row_audit, reconciliation

## Key Table Design Rules
- Surrogate PK (`bigserial` or `uuid`) + legacy business keys.
- Add `firm_id`, `fiscal_year`, `is_active`, `created_at`, `updated_at`.
- Add optimistic lock column where high write contention exists.

## Indexing
- Composite indexes for query paths:
  - `(firm_id, fiscal_year, business_date)`
  - `(firm_id, legacy_doc_no)`
  - `(firm_id, account_no)`
- Partial indexes for open/pending states.
- GIN indexes only for search use cases.

## Flyway
- Versioned baseline + module migrations.
- No destructive migration without archival step.

## Partitioning
- Partition large transactional tables by fiscal year when row count thresholds are crossed.
