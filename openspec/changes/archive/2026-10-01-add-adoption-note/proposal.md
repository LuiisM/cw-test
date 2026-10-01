# Proposal

## Why

The badge's breaking API change needs a clear adoption plan for consuming teams. Part 4 asks for a short written explanation of release strategy, safe migration, and the risks of loading multiple kit versions.

## What Changes

- Add a roughly half-page `ADOPTION.md` covering versioning/release, consumer migration and safeguards, and multi-version coexistence.
- Ground the note in the delivered `status`/`size` API, current token scope, selector IDs, and remaining badge styling debt.
- Link the note from the root README and keep release recommendations clearly distinct from mechanisms already implemented.

## Capabilities

### New Capabilities

None. This is a documentation-only change with `skip_specs: true`.

### Modified Capabilities

None. The existing badge behaviour contract remains applicable.

## Impact

- Root `ADOPTION.md` and a README link.
- A coordinated major-release recommendation for a published kit; the starter's private `0.0.0` package is context, not a release action.
- Written safeguards and coexistence risks, as requested by the exercise.
