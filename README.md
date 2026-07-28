# YadroOS Platform

YadroOS is a modular web platform for organizational process management (CRM, communications, HR, finance, and monitoring) featuring a unified interface and shared technical stack. The repository contains a React + TypeScript frontend built with Vite, styled with Tailwind CSS, and a Node.js backend powered by Prisma and Express.

## Key Features

- **CRM**: clients, deals, tasks, and analytics with CSV import/export and unified mailing campaigns.
- **Communications**: unified inbox and messenger, real-time WebSockets integration, and a hybrid email strategy (IMAP/SMTP + external providers).
- **HR**: employee database, training, time tracking, performance evaluation, dynamic KPI tracking.
- **Accounting and Finance**: invoices, transactions, billing, tax calculation, dynamic cash flow tracking, multi-currency support via external APIs (NBU).
- **Analytics and Monitoring**: reports, dashboards, AI suggestions.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router.
- **Backend:** Node.js, Express, Prisma ORM, Socket.IO.
- **Database & Services:** PostgreSQL, Docker, Docker Compose for unified dev environments.
- **AI Capabilities:** Google Gemini 3.1 Flash Lite via `@google/generative-ai` SDK with **Function Calling / Actionable Tools** (autonomous CRM deal creation, messaging, etc.) and intelligent fallbacks.
- **Testing and Quality:** ESLint, Prettier, **Vitest** for robust unit and RBAC integration testing.

## Repository Structure

```
.
├── .github/workflows/    # CI/CD pipelines (format, lint, type-check, test, build)
├── backend/              # Full-fledged Express API, Prisma ORM, and WebSocket server
├── docs/                 # User, technical, and administrative documentation
├── public/               # Static assets for Vite build
├── src/                  # React Frontend application code
│   ├── api/              # Client wrappers over HTTP/REST
│   ├── components/       # Reusable UI components
│   ├── modules/          # Major business modules (CRM, HR, finance, communications, ai)
│   ├── pages/            # Routable pages
│   ├── services/         # Client services and integrations
│   └── store/            # State management (Zustand)
├── tests/                # Vitest unit and integration tests
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Vitest test configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── docker-compose.yml    # Unified container environment (Frontend, Backend, DB)
```

## Quick Start (Docker - Recommended)

The easiest way to spin up the entire platform (Frontend, Backend, and PostgreSQL database) simultaneously in development mode is through Docker Compose.

1. Ensure Docker Desktop is running.
2. Run the following command in the root of the project:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - **Frontend UI:** `http://localhost:5187/`
   - **Backend API:** `http://localhost:3000/api`
   - **Database (PostgreSQL):** `localhost:5433`

### Seeding Test Data

To populate the system with a realistic test organization (clients, deals, invoices, and employees), run the Prisma seed script inside the backend container:

```bash
docker-compose exec backend npx prisma db seed
```

This script will generate an admin user with the following credentials:
- **Email**: `parker_simonis95@yahoo.com`
- **Password**: `Password123!`

---

## Manual Local Installation

If you prefer to run things without Docker:

1. Install Node.js 20+ and npm.
2. Provide a PostgreSQL database and configure the connection in `backend/.env`.
3. In `backend/`: Run `npm install`, then `npx prisma db push`, and start the backend with `npm run dev`.
4. In the root directory: Run `npm install` and start the frontend with `npm run dev`.

## Build and Checks

- Frontend build:
  ```bash
  npm run build
  ```
- Self-contained single-HTML demo build (for running without Node.js/server):
  ```bash
  npm run build:single
  ```
  After this, open `dist/index.html` directly (suitable for UI demonstration, routes work via #).
  If `assets/` folders remain in `dist/`, delete `dist/` and repeat `npm run build:single` or run `npm run build:single:clean`.
- Type checking (TypeScript):
  ```bash
  npm run type-check
  ```
- Production build preview:
  ```bash
  npm run preview
  ```
- Static analysis and formatting:
  ```bash
  npm run lint
  npm run format
  ```

## Documentation

- Documentation overview: [docs/README.md](docs/README.md)
- Technical details: `docs/technical/` (architecture, API, database, developer guide).
- User guides: `docs/user/`.
- Operational instructions: `docs/admin/`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching rules, code style, and required checks before committing.
