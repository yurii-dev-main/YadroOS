# Contributing to YadroOS

These guidelines help maintain a consistent development style and simplify code reviews.

## Environment Requirements

- Node.js 20+ and npm (versions from `.nvmrc`, if added).
- Installed dependencies: `npm install`.

## Workflow

1. **Branching.** Create a separate branch off `main` for each task (`feature/<short-desc>` or `fix/<short-desc>`).
2. **Code Consistency.** Before committing, ensure the CI checks will pass locally:
   ```bash
   npm run lint
   npm run format:check
   npm run type-check
   npm run test
   ```
3. **Tests.** Store **Vitest** tests in `tests/` or alongside the module. The CI pipeline will strictly verify them.
4. **Commits.** Make commit messages meaningful (e.g. `feat(ai): implement agentic function calling`).
5. **PR.** GitHub Actions will automatically run linting, typing, formatting, and unit/integration tests on your pull request.

## Code Style

- TypeScript/React: follow existing component and hook patterns in `src/components` and `src/hooks`.
- Import only what is necessary, avoid unjustified global state — prefer local hooks and types from `src/types`.
- Write styles using Tailwind classes; for common patterns, use pre-built components and utilities.

## Documentation

When adding or modifying functionality, update relevant files in `docs/` (user guides, technical diagrams, admin checklists) and reflect changes in `README.md` if necessary.
