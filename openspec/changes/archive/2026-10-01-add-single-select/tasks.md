# Tasks

## 1. Public Contract and Rendering

- [x] 1.1 Add the standalone `SingleSelect` component and `SingleSelectOption` contract under `src/lib/single-select/`, with required options and visible label, the three agreed text inputs, and explicit rejection of empty option arrays and duplicate values. Export the component and option type through `src/lib/public-api.ts`; verify configuration errors and domain-independent options in focused component tests.
- [x] 1.2 Render the non-editable combobox, associated label, listbox options, committed selection, unavailable indications, and configurable text. Add basic layout and visible state styling through semantic CSS hooks with inherited/system fallbacks for this Part 1 baseline; verify role/label relationships, default and overridden text, and distinct instance IDs in DOM tests. The shared token mappings and second theme remain Part 2 work.
- [x] 1.3 Document the public option contract, input defaults, non-empty array precondition, and reactive-form usage in `src/lib/single-select/README.md`; verify the examples import only from the public entry point and agree with the exported TypeScript API.

## 2. Forms, Validation, and External Updates

- [x] 2.1 Implement `ControlValueAccessor` with local reactive state, bidirectional value updates, form-controlled disabled state, and touched notification on leaving the control. Verify with a reactive-form host that programmatic writes and reset do not become user edits, disabled controls block interaction, and confirmation/touch ordering supports both default and blur-based update strategies.
- [x] 2.2 Implement membership validation through Angular's `Validator` contract and its option-change callback, retaining unmatched values and exposing `optionNotFound` with accessible feedback. Verify unknown-value recovery, `null`, existing disabled selections, and composition with a consumer's required validator in form-host tests.
- [x] 2.3 Reconcile replacement arrays by stable value, refreshing labels and availability without emitting user changes; preserve unmatched committed values and close without committing if the active option disappears. Verify reordering, recreated objects, removed/restored values, and unchanged dirty/touched flags in focused tests; document the external-update and validation policy in the component README.

## 3. Selection, Keyboard, and Focus

- [x] 3.1 Implement pointer and keyboard opening, arrow navigation, enabled-option confirmation with Enter/Space or click, Escape cancellation, and Tab confirmation followed by normal focus traversal. Verify in interaction tests that navigation does not change the form value, confirmation closes, Escape preserves the previous value, and Tab is not prevented; document the keyboard contract in the component README.
- [x] 3.2 Keep disabled options navigable but unselectable, retain DOM focus on the combobox during navigation, and maintain valid `aria-activedescendant`, expanded, selected, and disabled states throughout popup changes. Prevent pointer/blur ordering from losing focus or causing premature form updates; verify disabled confirmation paths, focus retention, active-ID cleanup, and removal of the active option in DOM/form tests, and document the focus model.

## 4. Typeahead and Long Lists

- [x] 4.1 Implement case-insensitive prefix navigation, repeated-initial cycling, and the fixed 700 ms timeout, preserving the full list and committed value. Clear the buffer and pending timer when closing or destroying the component; verify matching, cycling, timeout expiry without confirmation, and fresh searches after reopening with focused fake-timer tests.
- [x] 4.2 Provide a bounded scrollable popup and reveal the active option after its DOM element exists, including when navigation or typeahead reaches options beyond the visible portion of a several-hundred-option list. Verify stable active references and scroll requests with a large synthetic option set; document the typeahead timing, scroll behavior, and deliberately excluded virtualization/filtering in the component README.

## 5. Workbench Integration

- [x] 5.1 Adapt reviewer fixture identifiers, names, and availability into the generic option contract and replace the Review filters placeholder using the existing `reviewerId` form control and public kit imports. Preserve the value/touched/dirty display and expose reset and disabled-state demonstrations; verify the integrated picker and form state in the workbench test without assuming fixture-specific identifiers or counts.
- [x] 5.2 Add a concise workbench verification walkthrough to the component README covering selection, cancellation, unavailable options, reset, and disabled state; verify the documented steps match the delivered controls and the generic API example demonstrates reuse beyond reviewers.

## 6. Integration Verification

- [x] 6.1 Run `npm test -- --watch=false`, `npm run build`, and `openspec validate add-single-select --type change --strict --no-interactive`; verify all pass and review the diff for unintended implementation changes outside this Part 1 scope.
- [x] 6.2 Verify the delivered control in a real browser using only the keyboard, including actual Tab focus traversal, Escape, pointer-to-keyboard continuity, and active-option visibility in a long list. Record the browser and observed results in the component README, explicitly distinguishing completed checks from any unverified screen-reader combinations; completion requires recorded browser checks, not only jsdom assertions.
