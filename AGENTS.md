# Repository Guidelines

## Project Structure & Module Organization
- `src/` houses the SvelteKit app, with routes in `src/routes/` (file-based routing such as `+page.svelte`) and shared code in `src/lib/` (components, stores, types, API helpers).
- `tests/` is split by scope: `tests/unit/`, `tests/integration/`, `tests/e2e/`, plus `tests/utils/` and `tests/config/`.
- `static/` contains public assets served as-is.
- `supabase/` contains database configuration and related assets.
- `docs/` holds operational guides (test setup, migrations, readiness checks).

## Build, Test, and Development Commands
- `bun run dev`: start the Vite dev server.
- `bun run build`: production build.
- `bun run preview`: preview the production build locally.
- `bun run check`: SvelteKit sync + type checks.
- `bun run lint`: run ESLint over the repo.
- `bun run test`: run unit and integration tests.
- `bun run test:e2e`: run Playwright E2E tests.
- `bun run test:verify`: validate the test environment configuration.

## Coding Style & Naming Conventions
- Use TypeScript and follow existing SvelteKit patterns (e.g., `+page.svelte`, `+layout.svelte`, `+page.server.ts`).
- Keep components under `src/lib/components/` and reusable logic under `src/lib/`.
- Prefer descriptive, feature-based folder names in `src/routes/`.
- Run `bun run lint` and `bun run check` before opening a PR.

## Testing Guidelines
- Unit and integration tests use Vitest; E2E tests use Playwright.
- Test files follow `*.spec.ts` naming (see `tests/unit/` and `tests/integration/`).
- Use `tests/e2e/` for browser flows; refer to `tests/e2e/README.md` for local setup.
- Coverage targets are 80%+ for unit tests; add tests for new behaviors.

## Commit & Pull Request Guidelines
- Use conventional commit prefixes seen in history (e.g., `feat:`, `fix:`, `refactor:`).
- PRs should include a clear description, test commands run, and linked issues.
- Include screenshots or short recordings for UI changes.

## Configuration & Secrets
- Use `.env.example` and `docs/TEST_ENVIRONMENT_SETUP.md` for environment setup.
- Do not commit real secrets; prefer local `.env` overrides.
