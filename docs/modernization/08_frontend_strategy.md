# Frontend Module and Reusability Strategy

## UI Composition
- MUI for forms, dialogs, layout scaffolding.
- AG Grid for high-volume tables with server-side model.
- React Hook Form + Zod for validated transactional forms.

## Shared Reusable Building Blocks
- `EntityGridPage` (filter, pagination, export actions)
- `TxnEntryForm` (header + line items + totals)
- `PermissionGuard`
- `AsyncJobTracker`
- `LegacyRefBadge`

## State Management
- Zustand slices:
  - auth
  - menu
  - ui-preferences
  - active-firm

## Routing
- React Router protected route tree based on backend menu payload.
- Lazy-loaded feature modules by domain.

## Performance
- AG Grid virtualization and server pagination.
- Debounced filter requests.
- Background prefetch for frequently opened masters.
