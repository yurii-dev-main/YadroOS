# Backend bootstrap

## Local environment

1. Copy `backend/.env.example` to `backend/.env` and set database credentials and JWT secrets.
2. Run `docker-compose up -d` from the repo root to start PostgreSQL and the backend API. Prisma will use `DATABASE_URL` from the backend `.env` file.
3. Apply migrations and seed data with `npm run prisma:migrate` and `npm run seed` inside `backend/`.

## Frontend integration

To switch the React client from mock services to the real API, create `.env.local` in the project root with:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

The axios client reads this variable and will forward requests to the backend (cookies included for refresh tokens). Remove or bypass any mock service wiring so that auth and data fetching use the real endpoints.
