# Contributing to YadroOS

These guidelines help maintain a consistent development style and simplify code reviews.

## Environment Requirements

- Node.js 20+ and npm (versions from `.nvmrc`, if added).
- Installed dependencies: `npm install`.

## Workflow

1. **Branching.** Create a separate branch off `main` for each task (`feature/<short-desc>` or `fix/<short-desc>`).
2. **Code Consistency.** Before committing, run:
   ```bash
   npm run lint
   npm run format
   npm run build   # type checking and build verification
   ```
3. **Tests.** Store unit tests in `tests/` next to the module being tested. Add new tests for modified functionality.
4. **Commits.** Make commit messages meaningful: what changed and why (for example, `feat(hr): add onboarding checklist`).
5. **PR.** In the description, specify the objective, key changes, checks (lint/build/tests), and any deployment risks.

## Code Style

- TypeScript/React: follow existing component and hook patterns in `src/components` and `src/hooks`.
- Import only what is necessary, avoid unjustified global state — prefer local hooks and types from `src/types`.
- Write styles using Tailwind classes; for common patterns, use pre-built components and utilities.

## Documentation

When adding or modifying functionality, update relevant files in `docs/` (user guides, technical diagrams, admin checklists) and reflect changes in `README.md` if necessary.
