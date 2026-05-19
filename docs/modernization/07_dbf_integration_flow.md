# DBF Integration Flow (FastAPI Bridge)

## Responsibilities
- Read DBF metadata and rows.
- Convert DBF field types to normalized payloads.
- Batch import to core API with idempotency keys.
- Export PostgreSQL data back to DBF-compatible files.

## Import Flow
1. Upload DBF bundle / point to folder.
2. Parse schema with `dbfread`.
3. Normalize rows with pandas transformations.
4. Split into chunked payloads.
5. Push to core API import endpoints.
6. Record row-level audit and errors.

## Export Flow
1. Request export by module/date range.
2. Fetch normalized rows from core API.
3. Apply legacy mapping rules and fixed-width constraints.
4. Generate DBF outputs + manifest.
5. Store artifact and provide download link.

## Async Execution
- Import/export tasks are queued.
- Job status endpoint supports polling from UI.
