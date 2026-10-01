# Design

## Context

See [proposal.md](proposal.md). This short design records the migration and coexistence choices the adoption note must explain. The starter is private at `0.0.0`; its code already removes the badge's old flags.

## Goals / Non-Goals

**Goals:** A roughly half-page note grounded in the current API and observable coexistence risks.

**Non-Goals:** Publishing, changing package versions, adding federation configuration, or implementing release automation.

## Decisions

- Recommend a coordinated major release for a published kit because old templates must migrate. Include the input mapping/defaults and require manual review of conflicting old flags; this is more honest than promising a universally safe codemod.
- Describe changelog/migration examples, consumer template compilation, focused regression/accessibility checks, and staged rollout as release safeguards. Clearly label proposed automation rather than imply it already exists.
- Prefer compatible shared Angular/forms and kit versions. Explain why forced sharing of a new major can break old consumers, while parallel copies risk global token overrides, per-copy selector ID collisions, and the badge's deep styling rule. Encapsulation and the `cw` prefix help but do not guarantee version isolation.

## Risks / Trade-offs

- A generic federation warning misses the actual design → cite the global `:root` tokens, static ID counter, and `::ng-deep` rule.
- Documentation can overclaim safeguards → distinguish current behaviour from recommended coordination, isolation, and checks.

## Migration Plan

Deliver `ADOPTION.md` and link it from the README; review it against the actual badge contract and `DECISIONS.md`.
