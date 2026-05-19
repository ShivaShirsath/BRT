# API Structure and Authentication Flow

## API Namespacing
- `/api/v1/auth/*`
- `/api/v1/menu/*`
- `/api/v1/masters/*`
- `/api/v1/transactions/*`
- `/api/v1/ledger/*`
- `/api/v1/reports/*`
- `/api/v1/migration/*`
- `/api/v1/jobs/*`

## Auth Flow
1. User submits credentials and firm context.
2. Backend validates and issues JWT access + refresh tokens.
3. Frontend stores access token in memory, refresh in secure cookie.
4. Route guards evaluate role + permission claims.
5. Dynamic menu API returns allowed menus and actions.

## RBAC Model
- Roles: `ADMIN`, `SUPERVISOR`, `OPERATOR`, `VIEWER`
- Permissions are action-level (`module:action`), not only page-level.
- Every mutating API enforces permission checks server-side.

## OpenAPI
- Generate and publish contract at `/swagger-ui` and `/v3/api-docs`.
- Frontend types can be generated from OpenAPI for strong typing.
