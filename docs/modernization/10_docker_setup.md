# Docker Setup

## Services
- `nginx`: reverse proxy for SPA + APIs
- `frontend`: React app build
- `backend`: Spring Boot API
- `dbf-service`: FastAPI DBF bridge
- `postgres`
- `redis`
- `rabbitmq`

## Runtime Topology
- Browser -> NGINX
- NGINX routes:
  - `/` -> frontend
  - `/api` -> backend
  - `/dbf` -> dbf-service
- Backend and DBF service share RabbitMQ for jobs.
