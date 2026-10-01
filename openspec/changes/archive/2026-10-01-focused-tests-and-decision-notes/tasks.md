# Tasks

This is a retrospective checklist. Completed items were implemented and verified before this OpenSpec change was created.

## 1. Focused Tests and Decision Notes

- [x] 1.1 Consolidate the selector tests around user-facing risks, retain the workbench integration checks, and deliver `DECISIONS.md` with five decisions, alternatives, and test-selection rationale. Verify the tests inspect DOM/form outcomes and the notes agree with the delivered code.

## 2. Badge Contract and Accessibility

- [x] 2.1 Replace the badge flags with typed `status` and `size`, export the types, migrate consumers, and document the breaking change in the README. Expose the label and hide only the decorative dot. Verify the focused badge tests, workbench compilation, and Chromium accessibility-tree label inspection.

## 3. Registration Verification

- [x] 3.1 Confirm that the current implementation matches the recorded successful test/build checks and run `openspec validate focused-tests-and-decision-notes --type change --strict --no-interactive`; verify the artifacts and completion tracking are coherent.

## Recorded Evidence

- `npm test -- --watch=false`: 15 tests passed (10 selector, 2 badge, 3 workbench).
- `npm run build`: production build passed.
- Chromium: the badge label was exposed as `Ready` in its accessibility tree. Live screen-reader combinations remain unverified.
