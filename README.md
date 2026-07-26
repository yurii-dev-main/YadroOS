# YadroOS Platform

YadroOS is a modular web platform for organizational process management (CRM, communications, HR, finance, and monitoring) featuring a unified interface and shared technical stack. The repository contains a React + TypeScript frontend built with Vite and styled with Tailwind CSS.

## Key Features

- CRM: clients, deals, tasks, and analytics.
- Communications: unified inbox and messenger, integrations with Telegram/IMAP/SMTP.
- HR: employee database, training, time tracking, performance evaluation.
- Accounting and Finance: invoices, transactions, billing, bonus calculation.
- Analytics and Monitoring: reports, dashboards, AI suggestions.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router.
- **Backend:** Node.js, Express, Prisma ORM, Socket.IO, SQLite/PostgreSQL.
- **AI Capabilities:** OpenAI API with **Function Calling / Actionable Tools** (autonomous CRM deal creation, messaging, etc.).
- **Infrastructure:** Nginx + PM2 (see `ecosystem.config.js`, `nginx/`), GitHub Actions for CI/CD.
- **Testing and Quality:** ESLint, Prettier, **Vitest** for robust unit and integration testing.

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
└── tailwind.config.js    # Tailwind CSS configuration
```

## Quick Start

### Automated Environment Setup

For quick deployment on a new machine, dependency installation scripts can be used.

**Ubuntu/Debian:**

```bash
./scripts/bootstrap.sh
```

**Windows (PowerShell as Administrator):**

```powershell
Set-ExecutionPolicy -Scope Process Bypass
./scripts/bootstrap.ps1
```

Optional flags:

- `--skip-docker` — skip Docker installation.
- `--skip-node` — skip Node.js installation.
- `--skip-git` — skip git installation.

PowerShell flags:

- `-SkipDocker` — skip Docker Desktop installation.
- `-SkipNode` — skip Node.js installation.
- `-SkipGit` — skip git installation.

After completion, log out and log back in if you were added to the `docker` group.

### Manual Installation

1. Install Node.js 20+ and npm.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server (default at http://localhost:5187/):
   ```bash
   npm run dev
   ```

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
