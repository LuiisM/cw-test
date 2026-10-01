# Design

## Context

See [proposal.md](proposal.md) and the root `DECISIONS.md`. This records delivered work; the badge API change crosses the kit's public entry point and workbench consumers.

## Goals / Non-Goals

**Goals:** Record the existing behaviour and evidence with minimal duplication.

**Non-Goals:** Additional implementation, broader badge styling cleanup, or Part 4 release/adoption documentation.

## Decisions

- Use single typed status/size inputs rather than precedence between conflicting booleans. The workbench adapts its domain values and the README documents the breaking migration.
- Keep the status label as accessible static text and hide only the decorative dot. Automatic live announcements across the whole list are unnecessary.
- Consolidate tests around observable DOM/form outcomes; reuse the existing runner rather than add a harness. The root `DECISIONS.md` carries the detailed rationale.

## Risks / Trade-offs

- Old templates use removed inputs → update them using the README migration example.
- DOM assertions do not prove screen-reader announcements → retain the documented browser checks and unverified screen-reader combinations.

## Migration Plan

The workbench migration is complete. Other consumers replace the old flags with `status` and `size`; publishing/versioning is covered separately by Part 4.
