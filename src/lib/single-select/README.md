# SingleSelect

`cw-single-select` is a standalone, non-editable single-select combobox. Import
`SingleSelect` and `SingleSelectOption` from the kit's public entry point.

## Public contract

| Input                | Contract / default                                                   |
| -------------------- | -------------------------------------------------------------------- |
| `options`            | Required immutable, **non-empty** `readonly SingleSelectOption[]`.   |
| `label`              | Required visible control label, independently of placeholder text.   |
| `placeholder`        | `Select an option`; displayed for `null`.                            |
| `unavailableText`    | `Unavailable`; accompanies disabled options and disabled selections. |
| `unmatchedValueText` | `Selection unavailable`; displayed for an unknown non-null value.    |

Each option has a unique string `value`, a display `label`, and a boolean
`disabled`. Labels are plain text and need not be unique. The form value is
`string | null`; even an empty string can be a valid option value. Empty arrays
(initial or replacement) and duplicate values throw explicit configuration
errors. Supply options before rendering; temporary empty/loading datasets are
outside this contract. Replace arrays rather than mutating existing options.

## Reactive-form example (another domain)

For a consumer under `src/app/`:

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SingleSelect, type SingleSelectOption } from '../lib/public-api';

@Component({
  selector: 'app-delivery-picker',
  imports: [ReactiveFormsModule, SingleSelect],
  template: `
    <cw-single-select
      label="Delivery method"
      [options]="deliveryOptions"
      [formControl]="deliveryMethod"
      placeholder="Choose delivery"
    />
  `,
})
export class DeliveryPicker {
  readonly deliveryOptions: readonly SingleSelectOption[] = [
    { value: 'standard', label: 'Standard delivery', disabled: false },
    { value: 'express', label: 'Express delivery', disabled: true },
  ];
  readonly deliveryMethod = new FormControl<string | null>(null, Validators.required);
}
```

Use the form control's `setValue`, `reset`, `disable`, and `enable` methods for
external updates. Angular owns the form value and its dirty/touched flags.
Required-field validation belongs to the consumer.

## External updates and validation

Programmatic writes and reset update presentation without reporting a user edit.
They discard any provisional navigation and close the popup. Form-controlled
disabling also closes the popup and blocks interaction. Touched is reported when
focus leaves the combobox; opening, navigation, and cancellation do not make the
form dirty. Confirming the same value does not report a change.

Unknown non-null values are retained and displayed as `unmatchedValueText`, with
associated visible feedback and an invalid state on the enabled combobox. The
component's Angular validator returns `{ optionNotFound: true }`. It returns no
membership error for `null`, or for an existing option even if disabled. Angular
composes this with consumer validators; disabled form controls use Angular's
normal validation semantics.

Replacement arrays reconcile committed and active values by `value`, preserving
identity through reordering and recreated objects. Labels and availability
refresh; removed committed values remain in the form, and restoring them clears
the membership error. If the active option disappears, the popup closes without
confirmation or moving focus. Option replacement requests Angular revalidation
without invoking the value-accessor change/touch callbacks or altering
dirty/touched flags. Angular's revalidation can notify its own observable
subscribers; that is not a user edit.

## Keyboard contract

| Key / action                                | Behavior                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| Click combobox, Enter, Space, Arrow Down/Up | Open at the committed option; otherwise first (last for Arrow Up).                  |
| Arrow Down/Up while open                    | Move the provisional active option, including disabled options; stop at boundaries. |
| Home / End                                  | Open if needed and activate the first / last option.                                |
| Enter / Space, or click an enabled option   | Confirm and close.                                                                  |
| Escape                                      | Cancel and close, preserving the committed value.                                   |
| Tab / Shift+Tab while open                  | Confirm an enabled active option, close, and traverse normally.                     |
| Tab / Shift+Tab while closed                | Traverse normally without changing selection.                                       |
| Enter / Space or click a disabled option    | Leave the popup open without confirming.                                            |
| Tab with a disabled option active           | Close and traverse without changing selection.                                      |

Navigation does not change the form value or selected indicator. Tab confirmation
is delivered before the blur/touch callback, including for `updateOn: 'blur'`.
Moving focus away by another means cancels provisional navigation.

## Focus and accessibility model

DOM focus stays on the combobox; options are not separate tab stops. The popup
has `tabindex="-1"`, preventing a scroll container from becoming an implicit Tab
stop in browsers such as Chromium. The visible label is associated with the
combobox, and `aria-expanded`, `aria-controls`, and
`aria-activedescendant` describe the open list and its active option. Instance and
value-based option IDs are unique; labels are never used as identifiers.
`aria-selected` follows the committed value, not provisional navigation.
Disabled options retain `aria-disabled="true"` and a visible text indication.

Pointer presses on options prevent default focus transfer, allowing confirmation
before a blur-based form update. Pointer opening explicitly focuses the
combobox, so keyboard navigation can continue immediately. Confirmation and
Escape retain that focus. Closing clears the active reference before removing
the popup; Tab and Shift+Tab do not prevent traversal or restore focus.

## Typeahead and long lists

Typing a printable character opens the popup if necessary. Case-insensitive
label-prefix matching activates a candidate without filtering or confirming.
A single initial searches from the next option and wraps; repeating that initial
cycles through matching options, including disabled ones. Different subsequent
characters extend the prefix and include the current candidate when searching.
An unmatched prefix preserves the active option.

The internal timeout is **700 ms from the most recent typed character**. Expiry
clears only the prefix, leaving the active option and form value unchanged. Every
closure and component destruction clears the buffer and cancels its timer.
The timeout is fixed, not a public input.

The popup has a bounded scrollable height (`--cw-select-popup-max-height`, default
`16rem`). An Angular post-render effect reveals the active option with
`scrollIntoView({ block: 'nearest', inline: 'nearest' })`, after its element exists.
All options remain rendered and tracked by stable values. A 400-option synthetic
list exercises navigation, typeahead, focus, and scroll requests in component
tests; actual visibility requires browser verification. Filtering, virtualization,
asynchronous loading, and popup collision/flip handling are deliberately excluded.

## Workbench verification walkthrough

Run `npm start` and open `http://localhost:4200`. In **Review filters**:

1. Tab to **Reviewer**. Enter or Space opens it. Explore with arrows: the active
   outline moves while the displayed value and dirty flag stay unchanged.
2. Reach an available reviewer and press Enter. The popup closes, the supplied
   identifier appears in **value**, and **dirty** becomes true. Focus stays on
   Reviewer; **touched** becomes true when you Tab away.
3. Reopen, navigate to a different reviewer, and press Escape. The previous
   committed selection stays unchanged. Reopen and use Tab to confirm instead:
   focus should land on **Reset reviewer**. Shift+Tab traverses backwards normally.
4. Navigate to an option marked **Unavailable** (when present in the fixture).
   Enter, Space, and clicking it must leave the list open and selection unchanged.
   Tab closes without confirming and advances focus.
5. Click an available option, then immediately reopen/navigate using the keyboard.
   Focus should remain on the combobox through pointer confirmation.
6. Activate **Reset reviewer**. The placeholder returns, and value/touched/dirty
   return to `—` / false / false.
7. Activate **Disable reviewer picker**. The picker cannot open and is skipped
   by normal Tab traversal. **Enable reviewer picker** restores interaction.

For a temporary long-list check in the development workbench, run this in browser
DevTools, then use the keyboard on Reviewer (reload afterwards to restore fixtures):

```js
const workbench = ng.getComponent(document.querySelector('app-root'));
workbench.reviewerOptions = Array.from({ length: 400 }, (_, index) => ({
  value: `item-${index}`,
  label: index === 350 ? 'Zebra destination' : `Item ${index}`,
  disabled: index === 350,
}));
ng.applyChanges(workbench);
```

Open the list and press End, then arrows. The last options should be visible.
Type `z`: **Zebra destination** should become active and visible, without changing
the value; Enter cannot confirm this disabled option. Escape cancels. This uses
the delivered generic control with temporary application data, not a special
long-list implementation.

## Recorded browser verification

Completed on **2026-09-30**, on Linux with **Chromium 153.0.8010.12** (Chrome for
Testing, driven headlessly by Playwright) against the development workbench at
`http://127.0.0.1:4201`. Keyboard checks used actual browser key presses and focus
traversal, rather than synthetic jsdom key events. Desktop viewport: 1280 × 960;
small viewport: 375 × 812.

| Completed check                   | Observed result                                                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard-only entry and selection | Tab reached Reviewer; Space opened; arrows explored without changing the value; Enter confirmed, closed, and retained focus.                                                          |
| Accessibility tree                | Chromium exposed the combobox name `Reviewer` and the committed option label as its value.                                                                                            |
| Escape                            | Preserved the prior selection, retained focus, and removed the active-descendant reference.                                                                                           |
| Tab / Shift+Tab                   | Tab confirmed and actually focused Reset reviewer; Shift+Tab traversed normally back to Reviewer.                                                                                     |
| Unavailable fixture option        | Arrows reached it; Enter, Space, and pointer confirmation left the popup open; Tab left without selecting it.                                                                         |
| Pointer-to-keyboard continuity    | Clicking an available option retained combobox focus; immediate arrow opening/navigation and Escape worked.                                                                           |
| Reset and form-disabled state     | Reset cleared value/touched/dirty; the disabled picker was skipped during actual traversal and could be re-enabled.                                                                   |
| 400-option list                   | End and arrows scrolled the final options into view; `z` revealed the disabled Zebra destination; confirmation was blocked; Escape cancelled and later Tab confirmed an enabled item. |
| Small viewport                    | Long-list keyboard navigation retained focus and kept the active option inside both popup and viewport bounds.                                                                        |

The run reported **zero page errors**. Browser verification caught and corrected
Chromium's implicit scroll-container Tab stop; the popup now explicitly excludes
itself from sequential focus navigation.

**Not verified:** live screen-reader announcements with NVDA/Chrome, JAWS/Chrome,
or VoiceOver/Safari, and interaction in Firefox or Safari. The Chromium
accessibility-tree check is structural evidence, not a screen-reader test or a
claim of complete WCAG conformance.

## Baseline styling

The component consumes purpose-driven `--cw-select-*` CSS hooks (surface, text,
border, focus, active surface/text, spacing and sizing), with inherited or system
color fallbacks. These hooks can be overridden on a parent or component host at
runtime. The shared defaults and light/dark theme mappings are defined in
`src/lib/tokens/_semantic.scss`; see the root README's Themes section for usage.
