# Tasks

## 1. Semantic Tokens

- [x] 1.1 Define the small set of semantic colors and reusable kit styling roles in `_semantic.scss`, referencing existing primitives and mapping the existing selector hooks. Add light defaults, dark overrides, and a brief comment documenting the theme selector. Verify the references and the resolved token values with and without `data-theme="dark"` on the document root.

## 2. Consumers and Demonstration

- [x] 2.1 Connect selector and badge styles to semantic tokens and workbench/global colors to the shared roles. Add a local light/dark toggle with a native button and target-theme label. Add one focused workbench test for switching both ways and retaining the reviewer value/flags after normal blur, plus a short root README usage note. Verify the test and visually check text, badge statuses, selector focus, popup, active/unavailable options, and disabled state in both themes.

## 3. Integration Verification

- [x] 3.1 Run `npm test -- --watch=false`, `npm run build`, and `openspec validate add-semantic-themes --type change --strict --no-interactive`; confirm they pass and review the diff against the agreed scope.
