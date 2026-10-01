# Decisions

## 1. Separate navigation from selection

The select-only combobox keeps DOM focus on its button and identifies the active
option with `aria-activedescendant`. Arrows explore; Enter/Space confirm; Escape
cancels; Tab confirms an enabled candidate before normal traversal. This prevents
navigation from silently changing the assigned reviewer. A native `<select>`
would reduce custom code, but would delegate confirmation/cancellation behaviour
to each browser and platform, requiring a different verification strategy.

## 2. Values belong to the form

Options are an immutable, non-empty array with unique string values; `null` means
no selection. Replacements reconcile by value, not object identity or index.
Unknown values are retained with `optionNotFound` validation rather than cleared,
so refreshed data cannot silently rewrite an assignment. Required validation is
consumer-owned. Clearing missing values was the simpler alternative, but loses
application data. Empty/loading datasets are excluded by this documented contract.

## 3. Prefix navigation keeps the list intact

Typing jumps to labels without filtering. Repeated initials cycle, including
unavailable options, and the prefix expires after 700 ms from the latest key.
That timeout is a practical default, not a user-validated value. Post-render
scrolling reveals active options in a bounded popup. An editable filter would
introduce search and result-set state; the existing approach is sufficient for
several hundred options. Virtualization is outside the brief.

## 4. Themes change shared meaning

Semantic CSS properties reference supplied primitives; light defaults and dark
overrides live together and are selected on `<html>`. Components share the same
styles, and existing selector hooks remain overridable. Separate component styles
per theme would duplicate rules and drift. One additional raw size primitive
supplies the popup's 16rem bound; the existing palette is reused.

## 5. Make the inherited badge's important states explicit

One typed `status` and one `size` replace conflicting boolean flags. This is a
breaking API change; the README shows the template migration. Keeping booleans
with precedence rules would preserve compatibility but still permit misleading
configurations. The label is exposed to assistive technology and only the dot is
decorative. Static text avoids unnecessary live announcements across an engagement
list. The legacy `!important` and deep workbench selector remain styling debt;
configuration correctness and readable status took priority.

## Why these tests

The focused suite targets unintended value commits, focus/ARIA references,
unavailable selection, forms update ordering, external option replacement,
typeahead/long-list navigation, and badge state/text regressions. Workbench tests
cover actual consumer integration and theme switching. Assertions inspect DOM
and form behaviour rather than private state. Browser checks cover real Tab
traversal and scrolling; jsdom assertions are not screen-reader verification.
Live screen-reader/browser combinations remain unverified, as recorded in the
selector README.
