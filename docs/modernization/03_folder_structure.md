# Scalable Folder Structure

## Monorepo Layout
```text
BRT/
  frontend-react/
  backend-java/
  service-dbf-python/
  infra/
  docs/
```

## Frontend (`frontend-react`)
```text
src/
  app/
    router/
    providers/
    store/
  shared/
    api/
    components/
    grid/
    forms/
    hooks/
    utils/
    types/
  modules/
    auth/
    dashboard/
    menu/
    masters/
      customers/
      suppliers/
      items/
      vehicles/
    transactions/
      inward/
      outward/
      challans/
      billing/
      patti/
    ledger/
      account/
      stock/
    reports/
    migration/
```

## Backend (`backend-java`)
```text
src/main/java/com/brt/
  config/
  security/
  common/
  auth/
  menu/
  masters/
  transactions/
  ledger/
  reports/
  jobs/
  migration/
src/main/resources/
  db/migration/
  openapi/
```

## DBF Service (`service-dbf-python`)
```text
app/
  main.py
  routers/
    health.py
    import_export.py
    metadata.py
  services/
    dbf_reader.py
    dbf_writer.py
    mapping.py
  workers/
    tasks.py
```
