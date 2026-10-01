# Proposal

## Why

The workbench has a reviewer form control but no selection component. Part 1 of the take-home exercise needs a reusable kit control whose keyboard navigation, selection, cancellation, and accessibility behavior are explicit and consistent.

## What Changes

- Add a non-editable, single-select combobox with a custom listbox popup.
- Accept a non-empty array of domain-independent options with `value`, `label`, and `disabled` fields, using string values and `null` for no selection. Reject an empty array as a consumer configuration error.
- Integrate with Angular forms for value, disabled state, touched, and dirty behavior.
- Preserve unmatched form values, communicate an unavailable selection, and expose the `optionNotFound` validation error instead of silently choosing another option or resetting the value.
- Reconcile replacement option arrays by `value`: preserve committed values, refresh labels and availability, and close the popup without committing if the active option disappears. External updates do not count as user edits.
- Keep option navigation separate from committed selection: Enter, Space, and clicking an enabled option confirm; Escape cancels; Tab confirms an enabled active option and advances focus.
- Keep disabled options discoverable during navigation while preventing their selection.
- Support prefix-based typeahead and a scrollable list for several hundred options, without filtering or virtualization.
- Replace the reviewer placeholder with a consumer that adapts fixture data and uses the existing reactive form control.

This change captures Part 1 only. The semantic token layer, second theme, status-badge changes, focused test selection, and submission documents belong to subsequent exploration of Parts 2–4. Multi-select, asynchronous loading, virtual scrolling, and popup collision or flip handling are outside the exercise scope.

## Capabilities

### New Capabilities

- `single-select`: A reusable, form-integrated selection control with accessible labeling, explicit confirmation and cancellation, keyboard navigation, disabled options, typeahead, and value-preserving validation and option updates.

### Modified Capabilities

None.

## Impact

- `src/lib/`: a new component and its option contract.
- `src/lib/public-api.ts`: exports for the component and its public option type.
- `src/app/app.ts` and `src/app/app.html`: reviewer data adaptation and integration with the existing `FormControl<string | null>`.
- The supplied fixture types remain application-owned; the kit does not depend on them.
- A new kit API is introduced. This proposal does not change an existing component API.
