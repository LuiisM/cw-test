# Adoption

## Versioning and migration

I would release the badge API change as a coordinated major for a published kit,
with a prerelease consumer pilot and a breaking-change changelog. The starter is
private at `0.0.0`. Consumers replace
`isReady` / `isProcessing` / `isError` with one `status`
(`neutral`, `ready`, `processing`, `error`), and `isSmall` / `isLarge` with one
`size` (`sm`, `md`, `lg`). Defaults are `neutral` and `md`. Conflicting or dynamic
legacy flags require an explicit consumer decision. Update bindings and imports
through the public entry point, then compile the consuming application.

## Safe adoption

I would publish the input mapping and before/after examples, gate releases on
consumer template compilation and the focused regression suite, and check keyboard,
focus, and screen-reader announcements in both themes. A codemod could convert
unambiguous cases but should flag conflicts for review. Pilot first, migrate teams
in stages, and keep the previous major available during migration. These are
release recommendations; live screen-reader checks remain pending.

## Two versions on one page

Two Angular/forms runtimes can break dependency-injection/value-accessor
resolution. I would coordinate compatible singleton Angular/forms and a migrated
kit major; forcibly sharing a new major with old remotes can break their bindings.
Angular style encapsulation and the `cw` prefix limit unrelated collisions, but
kit versions still share global `:root` tokens: last-loaded definitions can
restyle the other copy, and the badge's `::ng-deep` rule crosses component
boundaries. Each selector copy owns its ID counter, so parallel bundles can
produce `cw-single-select-0` and ambiguous ARIA references. Where parallel
versions are unavoidable, I would test both together, isolate/version their
styles, and coordinate page-unique IDs. Those mitigations are follow-up work,
not guarantees of the current design.
