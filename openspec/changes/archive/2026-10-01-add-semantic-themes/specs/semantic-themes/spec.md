# Semantic Themes Specification

## Purpose

Provide consistent, legible styling for the existing UI kit through semantic tokens, with light and dark themes that can be demonstrated at runtime.

## ADDED Requirements

### Requirement: Purpose-driven styling tokens

The kit SHALL expose purpose-driven CSS custom properties referencing the supplied primitives for its colors and reusable styling values. The selector and status badge SHALL consume semantic tokens, and the workbench SHALL use the shared color roles. The selector's existing `--cw-select-*` styling hooks SHALL remain usable.

#### Scenario: Consume shared styling

- **WHEN** the selector, status badge, and workbench are rendered
- **THEN** their colors follow the shared semantic roles, and consumers can override the selector's existing styling hooks

### Requirement: Light and dark themes

The application SHALL use the light theme by default and SHALL support a dark theme selected through `data-theme="dark"` on the document root. Theme changes SHALL update the existing UI through CSS custom properties without requiring different component styles or a page reload.

#### Scenario: Default presentation

- **WHEN** the workbench is opened without selecting a theme
- **THEN** the light theme is displayed

#### Scenario: Dark presentation

- **WHEN** the document root has `data-theme="dark"`
- **THEN** the workbench, selector, and status badge display the dark theme

### Requirement: Workbench theme toggle

The workbench SHALL provide a keyboard-operable button whose label identifies the theme it will activate. Activating it SHALL alternate between light and dark themes without rewriting the reviewer selection or resetting its form interaction flags.

#### Scenario: Switch themes in place

- **WHEN** the user activates the theme button twice after selecting a reviewer and moving focus away from the picker
- **THEN** the workbench switches to dark and back to light, the button label updates, and the reviewer value, dirty flag, and touched flag are retained

### Requirement: Legible themed states

Both themes SHALL keep component text legible and provide visible focus, active-option, unavailable-option, and badge status indications.

#### Scenario: Inspect states in both themes

- **WHEN** the user views badge statuses and exercises the selector's focus, popup, active option, unavailable option, and disabled-control states in each theme
- **THEN** labels remain readable and the corresponding visual indications remain distinguishable
