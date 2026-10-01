# Engagement UI Kit — Starter Project

An Angular starter for the design system exercise: a small UI kit, the token layer it is built
on, one supplied component, and a workbench application that consumes the kit. Your exercise
brief describes what to build.

## Requirements

- Node.js 20.19+, 22.12+ or 24+ (see `.nvmrc`)
- npm 10+

## Running the project

```bash
npm install                 # install dependencies
npm start                   # dev server on http://localhost:4200
npm test                    # run the tests in watch mode
npm test -- --watch=false   # run the tests once
npm run build               # production build
```

Angular 21, zoneless, strict TypeScript. Tests run on Vitest via the Angular CLI. Prettier is
configured (`npx prettier --write .`); formatting is not assessed.

## The domain

- **Engagement** — a piece of client work, e.g. a statutory audit for one client and one year.
- **Change** — one proposed modification to an engagement, categorised by a `group` label.
- **Reviewer** — a person who can be assigned to review an engagement's pending changes.

The kit is the shared component layer these screens are built from. It is consumed by several
product teams, so its public API, its accessibility behaviour and its theming are the parts that
matter.

## The kit

Everything under `src/lib/` is the kit. Its public surface is
[`src/lib/public-api.ts`](src/lib/public-api.ts): consumers import from there and should never
need to reach into a component folder.

### Tokens

Three files under `src/lib/tokens/`:

| File               | What it is                                                       |
| ------------------ | ---------------------------------------------------------------- |
| `_primitives.scss` | Supplied. Raw values — palette, spacing, radii, type, elevation. |
| `_semantic.scss`   | Purpose-driven tokens, light defaults, and dark overrides.       |
| `tokens.scss`      | The entry point, loaded once from `src/styles.scss`.             |

Primitives are CSS custom properties, so the layer above them can be re-pointed at runtime. A
primitive says what a value _is_ (`--cw-blue-600`); it never says what it is _for_.

### Themes

Light is the default. Use **Switch to dark theme** in the workbench to alternate
themes at runtime. The selector, badges, and page share `--cw-color-*` roles;
`_semantic.scss` maps these roles to primitives and provides the dark overrides.
The existing `--cw-select-*` hooks remain available for component overrides.

Consumers can select the dark theme with `<html data-theme="dark">`, and return
to light with `data-theme="light"` or by removing the attribute. Tokens are loaded
once through `tokens.scss`; theme switching uses the CSS cascade.

### The supplied component

`cw-status-badge` ([`src/lib/status-badge/`](src/lib/status-badge)) shows an engagement's
processing state. It is real code of the kind that accumulates in a component library before
anyone owns it, and your brief asks you to do something about it. Read it before you judge it.

#### StatusBadge API — breaking change

The mutually exclusive inputs are now `status` (`neutral`, `ready`, `processing`,
`error`; default `neutral`) and `size` (`sm`, `md`, `lg`; default `md`). The types
`StatusBadgeStatus` and `StatusBadgeSize` are exported from the public entry point.

Replace `isReady`, `isProcessing`, and `isError` with one `status` value, and replace
`isSmall` / `isLarge` with one `size` value. This is a breaking API change: consuming
teams must update their templates. For example:

```html
<cw-status-badge label="Ready" status="ready" size="sm" />
```

Decision rationale and test priorities are summarized in [DECISIONS.md](DECISIONS.md).
Release, migration, and multi-version guidance is in [ADOPTION.md](ADOPTION.md).

## The workbench

`src/app/` is a consumer of the kit, not part of it. It exists so components can be built,
demonstrated and reviewed in a running application. Change it freely — including replacing the
placeholder in the _Review filters_ section, and updating call sites if you change a component's
API.

Sample data lives in [`src/app/data/engagement-fixtures.ts`](src/app/data/engagement-fixtures.ts).
The fixtures are representative rather than exhaustive, so rely on the shapes rather than on
specific ids, counts, ordering or values.

## What is yours

How the kit is put together is intentionally left to you: the semantic token layer and how a
theme overrides it, each component's public API, how accessibility behaviour is implemented, how
styles are structured, what the documentation surface looks like, and what you test. The starter
takes no position on any of it.

Visual design is not assessed beyond the components being usable and legible. Storybook is
welcome if you want it, but it is not expected and setting it up is not a good use of the time.

## Layout

```text
src/
  lib/                             # the kit
    public-api.ts                  # its public surface
    tokens/
      _primitives.scss             # supplied raw values
      _semantic.scss               # semantic roles + light/dark themes
      tokens.scss                  # style entry point
    status-badge/                  # the supplied component
  app/                             # the workbench: a consumer of the kit
    app.ts / app.html / app.scss
    app.config.ts
    data/engagement-fixtures.ts    # sample data
  styles.scss                      # tokens + a small reset
```
