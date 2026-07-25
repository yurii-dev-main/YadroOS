# Database and Frontend Auto-Start Protocol

This protocol describes launching the local environment via a single script that brings up the required databases and backend in Docker, and then starts the frontend.

## Prerequisites
- Docker Engine or Docker Desktop (with `docker compose` support).
- Node.js 20+ and npm (to run the frontend).

## Environment Composition
- PostgreSQL and backend are brought up via `docker-compose.yml`.
- Frontend is launched locally via Vite.

## Launching
1. From the repository root, run:
   ```bash
   ./scripts/start-local.sh
   ```
2. The script will:
   - bring up the `db` and `backend` services via Docker Compose;
   - install dependencies if `node_modules` is missing;
   - start the frontend using the `npm run dev` command.

## Expected Addresses
- Frontend (Vite): http://localhost:5187
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

## Stopping
- Stop frontend: `Ctrl+C` in the terminal where the script is running.
- Stop containers:
  ```bash
  docker compose down
  ```

## Troubleshooting
- Container status:
  ```bash
  docker compose ps
  ```
- Backend logs:
  ```bash
  docker compose logs -f backend
  ```
