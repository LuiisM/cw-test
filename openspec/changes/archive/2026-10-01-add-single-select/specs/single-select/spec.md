# Single-Select Specification

## Purpose

Provide a reusable selection control that lets users discover options, confirm one value, or cancel navigation while preserving the previous value, with keyboard and assistive technology support.

## ADDED Requirements

### Requirement: Domain-independent options and values

The control SHALL accept a non-empty array of options with `value`, `label`, and `disabled` fields. Option values SHALL be unique strings, and the control's value SHALL be a string or `null` representing no selection. The kit SHALL NOT require application-specific reviewer types.

#### Scenario: Adapt reviewer fixtures

- **WHEN** the workbench provides options adapted from reviewer identifiers, names, and availability
- **THEN** the control displays the supplied labels and returns the chosen string value without depending on the reviewer fixture type

#### Scenario: Use another domain

- **WHEN** a consumer supplies options from a different domain using the same option contract
- **THEN** the same selection behavior is available without reviewer-specific configuration

### Requirement: Reject empty option arrays

The control SHALL reject an empty option array as a consumer configuration error. The error SHALL identify that at least one option is required, rather than presenting an empty selectable list. This contract SHALL apply to the initial array and any replacement array.

#### Scenario: Empty initial options

- **WHEN** a consumer supplies an empty option array
- **THEN** an explicit configuration error identifies the non-empty option requirement

#### Scenario: Empty replacement options

- **WHEN** a consumer replaces an existing option array with an empty array
- **THEN** the same configuration error is reported instead of treating the replacement as a valid empty list

### Requirement: Accessible label, value, and popup state

The control SHALL have a visible, programmatically associated label and display the committed selection. Assistive technology SHALL be able to determine that it is a non-editable combobox, its current displayed value, whether the popup is expanded, and which option is active during navigation.

#### Scenario: Inspect the closed control

- **WHEN** a user reaches a closed control with an existing selection
- **THEN** its label, combobox role, selected label, and collapsed state are available to assistive technology

#### Scenario: Explore the open list

- **WHEN** the user opens the popup and navigates to an option
- **THEN** the expanded state and active option are available to assistive technology while the committed value remains unchanged

### Requirement: Configurable selection text

The control SHALL provide optional `placeholder`, `unavailableText`, and `unmatchedValueText` inputs, defaulting respectively to `Select an option`, `Unavailable`, and `Selection unavailable`. The placeholder SHALL represent a `null` form value. The unavailable text SHALL indicate disabled options and a matching disabled selection. The unmatched-value text SHALL represent a retained non-null value absent from the options. Consumers SHALL be able to override each text independently without changing selection, availability, or validation behavior. A visible, associated control label SHALL remain required independently of the placeholder.

#### Scenario: Default no-selection text

- **WHEN** the form value is `null` and no placeholder override is supplied
- **THEN** the control displays `Select an option` while retaining its separate, programmatically associated visible label

#### Scenario: Default disabled-option text

- **WHEN** an option or an existing matching selection is disabled and no unavailable-text override is supplied
- **THEN** its label is accompanied by `Unavailable` and its unavailable state remains available to assistive technology

#### Scenario: Default unmatched-value text

- **WHEN** a retained non-null form value has no matching option and no unmatched-value-text override is supplied
- **THEN** the control communicates `Selection unavailable` rather than the no-selection placeholder

#### Scenario: Consumer overrides selection text

- **WHEN** a consumer supplies its own placeholder, unavailable text, or unmatched-value text
- **THEN** the supplied text is used for the corresponding state without changing the associated label, committed value, availability rules, or membership validation

### Requirement: Angular form integration

The control SHALL support Angular form value updates in both directions, form-controlled disabled state, and touched and dirty behavior. Programmatic value changes SHALL NOT be reported as user edits. Opening, navigating, or cancelling the list SHALL NOT make the form control dirty. Leaving the control SHALL communicate that it has been touched.

#### Scenario: Programmatic value update

- **WHEN** a pristine, untouched form control is assigned an existing option value programmatically
- **THEN** the displayed selection updates without making the form control dirty or touched

#### Scenario: User changes the selection

- **WHEN** a user confirms a different enabled option with the form control's default update strategy
- **THEN** the form value updates and the form control becomes dirty

#### Scenario: User leaves the control

- **WHEN** the user moves focus from the selection control to another control
- **THEN** the associated form control becomes touched

#### Scenario: Disabled form control

- **WHEN** the form control is disabled
- **THEN** its unavailable state is communicated and user interactions cannot open the popup or change its value

### Requirement: Preserve and validate unmatched values

If a non-null form value does not match an option, the control SHALL preserve that value and communicate an unavailable selection visually and to assistive technology, distinct from no selection. For an enabled form control, it SHALL expose an `optionNotFound` validation error. It SHALL NOT silently select another option or reset the form value to `null`. A matching value SHALL NOT produce this error merely because its option is disabled. The component's membership validation SHALL NOT report `optionNotFound` for `null`; consumers SHALL retain ownership of required-field validation.

#### Scenario: Receive an unknown value

- **WHEN** an enabled form control receives a non-null value absent from the current options
- **THEN** that value is retained, an unavailable selection is communicated, and the form reports `optionNotFound`

#### Scenario: Recover by selecting an enabled option

- **WHEN** the user confirms an enabled option after an unmatched value was received
- **THEN** the form value becomes that option's value and `optionNotFound` is cleared

#### Scenario: Reset to no selection

- **WHEN** the consumer resets an unmatched form value to `null`
- **THEN** the control represents no selection and its membership validation clears `optionNotFound` without reporting a user edit

#### Scenario: Retain an existing disabled selection

- **WHEN** the form value matches an option that is disabled
- **THEN** the matching label and unavailable state are communicated, the value is retained, and membership validation does not report `optionNotFound`

### Requirement: Reconcile replacement options by value

When a valid non-empty replacement array is supplied, the control SHALL reconcile the committed selection and active option by `value`, independently of ordering or object identity. It SHALL update the displayed label and availability of a matching selection. If the committed value no longer matches an option, the unmatched-value policy SHALL apply. If the active option disappears while the popup is open, the popup SHALL close without committing a candidate and DOM focus SHALL remain on the combobox. External option updates SHALL NOT rewrite the form value or mark the control dirty or touched.

#### Scenario: Reorder and recreate options

- **WHEN** a consumer supplies new option objects in a different order while retaining the committed and active values
- **THEN** the same values remain committed and active rather than switching selection or activity by index

#### Scenario: Update the selected label

- **WHEN** a replacement array changes the label of the option matching the form value
- **THEN** the displayed label updates without changing the form value

#### Scenario: Remove the committed option

- **WHEN** a valid replacement array omits the committed non-null value of an enabled form control
- **THEN** the form value is preserved, the unavailable selection is communicated, and `optionNotFound` is reported

#### Scenario: Disable the committed option

- **WHEN** a replacement array marks the committed option as disabled
- **THEN** its value and label remain displayed with an unavailable indication, and subsequent attempts to confirm that option are blocked

#### Scenario: Remove the active option

- **WHEN** a valid replacement array omits the active option while the popup is open
- **THEN** the popup closes without committing, DOM focus remains on the combobox, and the committed value is retained

#### Scenario: Restore a previously unmatched value

- **WHEN** a valid replacement array adds an option matching a retained unmatched form value
- **THEN** the matching label is displayed and `optionNotFound` is cleared without changing the form value or reporting a user edit

#### Scenario: Preserve form interaction flags

- **WHEN** a valid external option update changes presentation or membership validity for a pristine, untouched form control
- **THEN** the form control remains pristine and untouched

### Requirement: Keyboard exploration, confirmation, and cancellation

The control SHALL be operable entirely with the keyboard. Users SHALL be able to open the list and move between options without changing the committed value. Enter or Space on an enabled active option, or clicking an enabled option, SHALL confirm that option and close the popup. Escape SHALL close the popup without changing the committed value. With the popup open, Tab SHALL confirm an enabled active option, close the popup, and perform normal focus traversal.

#### Scenario: Explore without committing

- **WHEN** the user opens the list and uses arrow keys to activate a different option
- **THEN** the option becomes active but the displayed committed selection and form value remain unchanged

#### Scenario: Confirm an enabled option

- **WHEN** the user presses Enter or Space on an enabled active option, or clicks an enabled option
- **THEN** that option becomes the committed selection and the popup closes

#### Scenario: Cancel with Escape

- **WHEN** the user activates a different option and presses Escape
- **THEN** the popup closes and the previous committed selection is retained

#### Scenario: Confirm and leave with Tab

- **WHEN** the user presses Tab with the popup open and an enabled option active
- **THEN** that option becomes the committed selection, the popup closes, and focus moves to the next control in the normal tab order

#### Scenario: Tab through a closed control

- **WHEN** the user presses Tab with the popup closed
- **THEN** focus advances normally without changing the committed selection

### Requirement: Discoverable but unselectable disabled options

Disabled options SHALL remain in the list and be reachable during keyboard navigation. Their unavailable state SHALL be communicated visually and to assistive technology. Keyboard and pointer confirmation SHALL NOT select a disabled option. Enter or Space on a disabled active option SHALL leave the list open and preserve the committed value. Tab on a disabled active option SHALL close the popup and advance focus without changing the committed value.

#### Scenario: Navigate to a disabled option

- **WHEN** the user moves through the list to a disabled option
- **THEN** the option becomes active and its label and unavailable state are available to the user

#### Scenario: Attempt to choose a disabled option

- **WHEN** the user presses Enter or Space on a disabled active option, or clicks a disabled option
- **THEN** the committed value remains unchanged and the popup remains open

#### Scenario: Leave from a disabled option

- **WHEN** the user presses Tab with a disabled option active
- **THEN** the popup closes, the previous committed value is retained, and focus advances normally

### Requirement: Predictable focus during interaction

The combobox SHALL retain DOM focus while the popup is open and keyboard navigation changes the active option. Opening, navigating, confirming, or cancelling the popup SHALL NOT lose focus to the document body. After confirmation or Escape, focus SHALL be on the combobox. Closing during normal focus traversal SHALL allow traversal to continue instead of returning focus to the combobox.

#### Scenario: Navigate while retaining combobox focus

- **WHEN** the user opens the popup and changes the active option with arrow keys or typeahead
- **THEN** DOM focus remains on the combobox and assistive technology can identify the newly active option

#### Scenario: Confirm or cancel without leaving

- **WHEN** a user confirms an enabled option or cancels with Escape
- **THEN** the popup closes and keyboard focus is on the combobox

#### Scenario: Leave with Tab

- **WHEN** the user closes the popup by pressing Tab
- **THEN** the next control receives focus and the combobox does not reclaim it

### Requirement: Prefix typeahead without filtering

Typing a prefix SHALL activate a matching option without committing it or removing options from the list. Matching SHALL be case-insensitive and SHALL NOT change the displayed option labels. Repeated typing of the same initial character within the prefix window SHALL cycle through matching options. The prefix SHALL reset after 700 ms without another typed character, measured from the most recent typed character. Expiry SHALL preserve the active option and committed value. Closing the popup SHALL clear the prefix. Disabled options SHALL remain discoverable through typeahead and SHALL remain unselectable.

#### Scenario: Find an option by prefix

- **WHEN** the user types a prefix that matches an option label
- **THEN** a matching option becomes active while the committed value and full option list remain unchanged

#### Scenario: Cycle matching initials

- **WHEN** multiple options share an initial character and the user repeatedly types that character with less than 700 ms between characters
- **THEN** navigation cycles through the matching options without committing a selection

#### Scenario: Match regardless of letter case

- **WHEN** the user types a prefix with different letter casing from a matching option label
- **THEN** the matching option becomes active and its displayed label remains unchanged

#### Scenario: Extend a prefix before expiry

- **WHEN** the user types a second, different letter less than 700 ms after the first letter and the resulting prefix matches an option
- **THEN** a matching option becomes active without filtering the list or committing the selection

#### Scenario: Expire the prefix without confirming

- **WHEN** 700 ms passes after the most recent typed character without another typed character
- **THEN** the prefix is cleared while the active option and committed value remain unchanged, and the next typed character starts a new prefix

#### Scenario: Start fresh after closing

- **WHEN** the user closes the popup with a prefix in progress, reopens it, and types a character
- **THEN** that character starts a fresh prefix instead of continuing the prefix from the previous opening

### Requirement: Navigation through several hundred options

The control SHALL support several hundred options with the same selection, cancellation, disabled-option, and typeahead behavior. The popup SHALL be scrollable, and the active option SHALL remain visible during navigation. Behavior SHALL NOT depend on fixture-specific identifiers, counts, or ordering.

#### Scenario: Navigate beyond the visible options

- **WHEN** keyboard navigation or typeahead activates an option outside the visible portion of a list containing several hundred options
- **THEN** the list scrolls to make that option visible without changing the committed value or losing keyboard focus
