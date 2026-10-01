# Proposal

## Why

The kit's semantic token layer is empty, so the selector, badge, and workbench cannot share a coherent theme. Part 2 needs a simple, demonstrable light/dark implementation proportional to the existing styling needs.

## What Changes

- Define purpose-driven CSS custom properties in `_semantic.scss`, referencing the supplied primitives for the colors and styling values actually used by the kit.
- Provide light defaults and dark color overrides selected by a document-level `data-theme` attribute.
- Connect the selector's existing CSS hooks, badge styles, and workbench colors to the semantic layer.
- Add one workbench button to switch themes at runtime, and a short usage note.

## Capabilities

### New Capabilities

- `semantic-themes`: Shared semantic styling with light/dark themes and a workbench demonstration of runtime switching.

### Modified Capabilities

None.

## Impact

- `src/lib/tokens/_semantic.scss` and the styles of the existing kit components.
- `src/styles.scss`, workbench styles, and a small theme toggle in `src/app/app.ts` and `src/app/app.html`.
- A focused toggle check in the existing workbench test and a brief theme usage section in the root README.
- Existing dependencies and public component APIs are sufficient. Verification uses the current test suite, production build, and a visual check of both themes.
