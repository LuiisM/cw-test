# Proposal

## Why

Part 3 and the inherited badge corrections were delivered outside OpenSpec. This change retrospectively records the completed work, its behaviour contract, and its verification.

## What Changes

- Consolidate the tests around user-facing risks and add `DECISIONS.md` with five decisions, alternatives, and test-selection rationale.
- **BREAKING**: replace the badge's conflicting state and size booleans with single typed `status` and `size` inputs; migrate workbench consumers and document the API change.
- Expose the badge label to assistive technology and hide only the decorative dot.

The implementation is already delivered. This registration records it rather than introducing additional implementation work.

## Capabilities

### New Capabilities

- `status-badge`: The existing component's updated exclusive status/size contract and accessible label. It has no current main spec, so this is its first OpenSpec specification.

### Modified Capabilities

None. The selector's behaviour is unchanged; its tests were consolidated.

## Impact

- Badge component, public type exports, workbench consumers, and README migration notes.
- Focused selector/badge tests and root `DECISIONS.md`.
- Verification already performed: 15 passing tests, successful production build, and Chromium accessibility-tree inspection of the badge label.
