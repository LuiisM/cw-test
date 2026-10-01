# Design

## Context

See [proposal.md](proposal.md) for motivation and [the single-select specification](specs/single-select/spec.md) for the behavior contract.

The workbench already uses `ReactiveFormsModule` and a `FormControl<string | null>`. Reviewer fixtures provide identifiers, names, roles, and optional availability flags. The library has one public entry point, and the application is Angular 21 with zoneless change detection.

The custom selection and focus model warrants a design document before implementation. This document distinguishes confirmed exploration decisions from recommended implementation details.

## Goals / Non-Goals

**Goals:**

- Keep the confirmed value, active option, and popup visibility as separate state.
- Keep reviewer data adaptation in the workbench and the component contract domain-independent.
- Make focus and accessibility relationships explicit throughout the popup lifecycle.

**Non-Goals:**

- Rich projected option content or arbitrary objects as form values in this first iteration.
- An additional search input, a dialog, or a focus trap around the list.
- Choosing the semantic token contract or the final verification suite during Part 1.

## Decisions

### Confirmed: Non-editable combobox with a custom listbox

Use a select-only combobox with a listbox popup. Navigation changes the active candidate; confirmation changes the committed value.

This makes cancellation and form updates explicit. The alternative, a native `<select>`, provides strong built-in accessibility and less code, but browser and platform interaction differences would need verification against the cancellation contract. An editable, filtering combobox adds a second value—the search text—and additional synchronization behavior that this exercise does not require.

### Confirmed: Array-based option contract with string values

Accept a non-empty array of options with `value`, `label`, and `disabled` fields. Option values are unique strings, and `null` represents no selection. The application maps reviewer `id`, `name`, and `unavailable` into that contract.

String values avoid object-identity comparisons and match the existing form. Projected options would allow richer presentation but require another contract for text extraction and keyboard matching. Arbitrary object values would require equality rules that add little value here.

### Confirmed: Reject empty option arrays as configuration errors

An explicitly supplied empty array is invalid both initially and when replacing options. Report a clear consumer configuration error identifying that at least one option is required. Check the contract once the option input is available; do not interpret a not-yet-initialized input as an explicitly supplied empty array.

The alternative is an empty-state popup or an automatically disabled control. Those behaviors would support empty datasets, but they are excluded by the agreed non-empty input contract. This is a configuration error, distinct from an unmatched form value that the user can recover from.

### Confirmed: Preserve external values and reconcile options by identity

Treat the form as the owner of its value. If a non-null value has no matching option, retain it and communicate an unavailable selection, for example, "Selection unavailable", rather than displaying the no-selection placeholder. Membership validation exposes `optionNotFound` for an enabled form control. Do not automatically choose the first option or reset the value to `null`.

Replacement arrays are reconciled by `value`, not by index or object identity:

- Reordering or recreating options preserves the committed and active values when those options still exist.
- Label changes refresh the displayed text without changing the form value.
- Removing the committed option invokes the unmatched-value policy. Restoring a matching option refreshes its label and clears `optionNotFound` without a user edit.
- Disabling the committed option retains its value and label, communicates its unavailable state, and blocks subsequent confirmation of that option. Disabled membership is not missing membership, so it does not produce `optionNotFound`.
- If the active option disappears while the popup is open, discard the provisional candidate, clear its active-descendant reference, and close while retaining DOM focus on the combobox.

An option update does not emit a form value change or a touch callback. It can change membership validity while leaving dirty and touched flags unchanged.

Alternatives include automatically clearing an unmatched value, choosing a fallback option, or preserving an active index. Clearing discards application-owned data, a fallback can silently assign a different reviewer, and index-based reconciliation can change the candidate after reordering. Stable identity and explicit validation avoid those outcomes.

### Confirmed: Configurable text with English defaults

Require a visible label independently of the placeholder. Provide three optional text inputs with these defaults:

| Input | Default | Purpose |
| --- | --- | --- |
| `placeholder` | `Select an option` | Display when the form value is `null`. |
| `unavailableText` | `Unavailable` | Indicate disabled options and an existing selection whose option is disabled. |
| `unmatchedValueText` | `Selection unavailable` | Communicate a retained non-null value that has no matching option. |

The workbench can supply `Select a reviewer` as its placeholder without putting reviewer terminology into the kit. Overrides change presentation, not labels supplied in the option data, availability semantics, or membership validation. The placeholder does not replace the associated control label.

Three direct text inputs keep the API small and let consumers supply product-specific wording or translations. The alternative is a kit-owned translation service or a more general message configuration system; neither is needed for this delivery.

### Confirmed: Explicit confirmation and discoverable disabled options

Enter, Space, and clicking an enabled option confirm and close. Escape cancels. Tab confirms an enabled active option, closes, and continues normal focus traversal. Tab from a disabled active option closes and advances without changing the committed value.

Disabled options remain navigable and communicate their unavailable state. Every confirmation path must check availability; `aria-disabled` alone does not prevent selection.

Alternatives were cancelling on Tab and skipping disabled options. Cancelling would reduce accidental changes when leaving, but Tab confirmation follows the APG select-only example. Skipping disabled options would shorten navigation but make their presence harder to discover with arrow keys.

### Confirmed: DOM focus stays on the combobox

The combobox remains focused while the popup is open. `aria-activedescendant` identifies the active option, and the option receives a visible active indicator.

The alternative is a button opening a listbox with real focus on its options, managed with roving tabindex. That is a viable pattern, but it requires transferring focus into the list and restoring it when the focused option is removed. Keeping focus on a stable combobox reduces that lifecycle work.

Accessibility relationships:

- A visible label is associated with the combobox through `aria-labelledby`.
- The combobox exposes `role="combobox"`, `aria-expanded`, and `aria-controls` for its listbox.
- The popup and its options expose `listbox` and `option` roles.
- `aria-activedescendant` is present only while an existing popup option is active. Clear it before removing the popup or its referenced option.
- `aria-selected` communicates the committed option; active navigation remains separately identified by `aria-activedescendant`.
- Disabled options expose `aria-disabled="true"` and a visible unavailable indication.
- Component-instance and option identifiers must be unique within the document; labels are not identifiers.

Enter or Escape closes without moving focus away from the combobox. Tab must not be prevented or followed by a focus-restoration call. Pointer selection must preserve the combobox focus until confirmation is complete.

### Confirmed: Prefix typeahead without filtering

Typeahead activates matching labels while retaining the full option list and committed value. Matching is case-insensitive without changing the displayed labels. Repeated initial characters within the buffer window cycle through matching options, including disabled ones. The active option is scrolled into view.

Use a fixed internal timeout of 700 ms after the most recent typed character. Another character before expiry extends the prefix, subject to the repeated-initial cycling behavior. At expiry, clear only the prefix; keep the active option and committed value unchanged. The next typed character starts a new prefix. Closing the popup clears the prefix and cancels its pending timeout so the next opening starts fresh.

700 ms is an agreed starting point, not a timing value validated with users. Keep it documented as an internal constant rather than exposing another input. A consumer-configurable timeout would expand the public API without a concrete requirement here.

Filtering would shorten the visible list but introduce result-set changes and additional search state. For several hundred simple options, prefix navigation and a bounded scrollable popup keep the model smaller.

### Recommended implementation: Angular forms adapter and local reactive state

Implement `ControlValueAccessor` around the existing reactive-forms contract. `writeValue` updates the displayed committed value without reporting a user edit; `setDisabledState` controls availability. Report confirmed user changes through the registered change callback and report touched when focus leaves the control. Do not mark the parent form's flags directly.

Implement Angular's `Validator` contract alongside the value accessor for membership validation. Return `{ optionNotFound: true }` for an unmatched non-null form value; return no membership error for `null` or an existing option, including a disabled one. Required-field validation remains the consumer's responsibility. Angular handles disabled-control validation according to its normal form semantics.

Use `registerOnValidatorChange` to request revalidation when the option input changes. Validate against the form value, not the provisional active candidate. Let Angular compose validation errors with the consumer's validators instead of directly replacing the parent control's errors. Associate visible unavailable-selection feedback with the combobox and expose its invalid state to assistive technology when applicable.

Tab confirmation must be processed before the touch callback, preserving compatibility with a consumer's blur-based update strategy. Opening, arrow navigation, typeahead, and Escape do not emit a value change.

Use signals for local state and computed values for derived selection data, matching zoneless change detection. Keep the option list immutable from the component's perspective, track rendered options by stable value, and avoid rebuilding the whole list on each navigation step.

Passing a parent `FormControl` directly into the component would couple it to one consumer form structure; a second standalone value/output contract would add synchronization rules. The forms adapter provides one value channel.

## Risks / Trade-offs

- **Custom ARIA behavior can be structurally correct but announced poorly** → Use the [APG select-only combobox example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) as a reference and verify the actual interaction with a screen reader. OpenSpec validation only checks the artifacts, not accessibility.
- **The browser does not automatically reveal an active descendant** → Explicitly scroll the active option into view after the popup option exists in the DOM.
- **Tab can commit a candidate while the user is leaving** → Document Tab as confirmation and Escape as cancellation.
- **Blur and pointer confirmation can happen in the wrong order** → Keep pointer interaction on options from prematurely transferring focus; distinguish confirmation, cancellation, and focus traversal when closing.
- **Hundreds of options create a larger DOM** → Use simple option content, stable rendering identity, and bounded scrolling. Do not claim a measured performance result before implementation is verified.
- **Retained unmatched values could appear to be ordinary empty selections** → Distinguish unavailable selection from `null` in the presentation and expose `optionNotFound` through form validation.
- **Option replacement can invalidate an active-descendant reference or leave membership errors stale** → Reconcile by stable value, close without committing when the active option disappears, and request revalidation through the validator callback.
- **The non-empty contract excludes temporary empty or loading datasets** → Document the consumer precondition and report explicit configuration errors; asynchronous loading remains outside the exercise scope.

## Migration Plan

Export the component and option contract through `src/lib/public-api.ts`. Adapt fixture data in the workbench and replace its placeholder using the existing reviewer form control. This introduces a new API rather than replacing an existing component API.

The workbench integration can be rolled back independently. Kit release versioning and status-badge migration are outside this Part 1 design.
