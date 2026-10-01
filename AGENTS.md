# Project Guide

## Environment and Commands

- Use the Node.js version specified in `.nvmrc` (Node.js 20.19+, 22.12+, or 24+) and npm 10+.
- Install dependencies with `npm install`.
- Run the development server with `npm start` at `http://localhost:4200`.
- Run tests once with `npm test -- --watch=false`; `npm test` runs in watch mode.
- Build production assets with `npm run build`.
- The project uses Angular 21, zoneless change detection, strict TypeScript, Vitest through the Angular CLI, and Prettier (`npx prettier --write .`).

## Project Boundaries

- `src/lib/` is the shared UI kit. Keep its public API in `src/lib/public-api.ts`; consumers must not import implementation details from component folders.
- `src/app/` is the workbench application and a consumer of the kit. It may be changed freely, including updating call sites when a component API changes.
- Sample engagement data is in `src/app/data/engagement-fixtures.ts`. Treat fixture types as representative; do not rely on particular IDs, ordering, counts, or values.

## Styling and Theming

- Raw design values belong in `src/lib/tokens/_primitives.scss`. Do not assign semantic meaning to primitives.
- Define purpose-driven semantic tokens in `src/lib/tokens/_semantic.scss`, using the primitive CSS custom properties so themes can override them at runtime.
- `src/lib/tokens/tokens.scss` is loaded once by `src/styles.scss`.

## Component Expectations

- Preserve intentional, documented public APIs for reusable kit components.
- Treat accessibility behavior and theming as first-class requirements for kit changes.
- `cw-status-badge` is supplied code in `src/lib/status-badge/`; read and understand it before changing it.
- Keep workbench-specific implementation out of the shared library.
