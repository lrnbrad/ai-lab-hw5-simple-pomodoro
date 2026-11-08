# Repository Guidelines

## Project Structure & Module Organization

- `src/App.vue`: Vue app entry point.
- `src/components/`: reusable UI components.
- `src/composables/`: timer, task, and progress logic.
- `src/style.css`: shared styles; `vite.config.js`: Vite setup.
- `tests/`: Playwright browser tests; `playwright*.config.js`: test configuration.
- `docs/`: project guidance; `.github/workflows/`: deployment automation.

## Build, Test, and Development Commands

Run commands from the repository root:

- `npm ci` installs the locked dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` creates the production site in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run test:e2e` runs Playwright browser tests.
- `npm run test:e2e:pages` builds the site and checks its GitHub Pages subpath configuration.
- Use Node.js 22.12 or newer.
- Playwright browser tests require Chromium.

## Coding Style & Naming Conventions

- Use two-space indentation, single quotes, no semicolons, and trailing commas in multiline structures.
- Name Vue components in PascalCase (for example, `TaskList.vue`); use camelCase for composables and utilities (for example, `usePomodoro.js`).
- Use descriptive kebab-case CSS classes.
- Keep timer, task, and progress logic in composables.

## Testing Guidelines

- Add or update Playwright tests in `tests/` named `*.spec.js`.
- Test observable behavior through accessible roles and labels, following existing examples.
- Run `npm run test:e2e` for UI behavior changes; run `npm run test:e2e:pages` for base path or deployment changes.
- No coverage threshold is configured.

## Agent Workflow

- Issues and specifications live in GitHub Issues; follow `docs/agents/issue-tracker.md` when working with them.
- Use the repository's five triage labels when sorting issues; meanings are in `docs/agents/triage-labels.md`.
- For domain terminology or architecture changes, follow `docs/agents/domain.md` for guidance on `CONTEXT.md` and architecture decision records.

## Commit & Pull Request Guidelines

- Use short, imperative commit subjects (for example, “Add configurable timers and exact session restore”); merge commits refer to ticket numbers.
- Keep commits focused and include an issue or ticket reference when available.
- Pull requests should summarize user-visible changes, link the related issue, and report test results.
- Include screenshots for visual changes.
