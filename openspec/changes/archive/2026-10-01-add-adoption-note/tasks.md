# Tasks

## 1. Adoption Note

- [x] 1.1 Write a roughly half-page `ADOPTION.md` covering the coordinated major-release recommendation, consumer input migration/defaults, documentation/automation safeguards, and concrete multi-version risks and mitigations. Link it from the README. Verify that all three Part 4 questions are answered and that recommendations agree with the current API, code, and `DECISIONS.md`.

## 2. Review and Validation

- [x] 2.1 Check Markdown formatting, review the diff for documentation-only scope, and run `openspec validate add-adoption-note --type change --strict --no-interactive`; verify all pass and the note distinguishes proposed release safeguards from existing implementation.
