# Design

## Context

See [proposal.md](proposal.md). The semantic layer is a stub; the selector already exposes CSS hooks, while the badge and workbench use fixed or primitive colors. This is a cross-cutting styling change with a small workbench interaction.

## Goals / Non-Goals

**Goals:** Reuse the existing palette and CSS hooks with one shared theme contract.

**Non-Goals:** Theme persistence, system-preference detection, a theme service, and component API or interaction refactors.

## Decisions

- Keep light defaults and `:root[data-theme='dark']` overrides together in `_semantic.scss`. A small set of shared color roles and the existing selector hooks is sufficient; additional theme files or a token-generation system add little here. Reusable kit spacing, type, and radius roles reference existing primitives.
- Select themes on `<html>` so global styles, kit components, and the workbench inherit the same variables. This is simpler than synchronizing separate themed wrappers.
- Use a local workbench signal and a native button to update the root attribute and button label. A shared service is unnecessary for one demonstration. Theme switching does not write to the reviewer form; ordinary blur still reports touched.

## Risks / Trade-offs

- Dark colors can reduce legibility → visually check text, badge statuses, focus, active options, unavailable options, and the disabled picker in both themes.
- jsdom does not prove rendered CSS appearance → use the existing tests plus one real-browser visual check.

## Migration Plan

Apply tokens and consumer style changes together; light remains the default. Rollback is a normal source revert with no data migration.
