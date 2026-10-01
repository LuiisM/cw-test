# Status Badge Specification

## Purpose

Communicate a supplied status label with a clear, mutually exclusive appearance and size, including text available to assistive technology.

## ADDED Requirements

### Requirement: Exclusive status and size

The badge SHALL accept one `status` value (`neutral`, `ready`, `processing`, or `error`) and one `size` value (`sm`, `md`, or `lg`), defaulting to `neutral` and `md`. Changing these inputs SHALL replace the previous status and size indications rather than accumulate contradictory ones. The former boolean state and size inputs SHALL be removed from the public API.

#### Scenario: Default appearance

- **WHEN** a consumer omits status and size
- **THEN** the badge has the neutral appearance and medium size

#### Scenario: Replace previous indications

- **WHEN** the inputs change from `ready` / `sm` to `error` / `lg`
- **THEN** only the error appearance and large size remain active

### Requirement: Accessible status text

The supplied label SHALL be visible and available to assistive technology. The decorative dot SHALL be hidden from assistive technology, and status meaning SHALL NOT depend on the dot's color alone.

#### Scenario: Read the label

- **WHEN** a badge has the label `Processing`
- **THEN** its text is available to assistive technology and the decorative dot is excluded

### Requirement: Public contract and migration guidance

The badge component and its status/size types SHALL be available through the kit's public entry point. Consumer documentation SHALL identify the boolean-input removal as a breaking change and show the replacement inputs.

#### Scenario: Migrate a consumer

- **WHEN** a team updates a template that used the old boolean flags
- **THEN** the migration guidance identifies the corresponding `status` and `size` inputs and the workbench demonstrates the updated API
