# component-patterns.md

## 1. Purpose

This document defines component architecture and UI patterns for `admin-web`.

Components must be:
- reusable
- predictable
- token-based
- accessible
- efficient in data-heavy workflows
- visually consistent across all modules

---

## 2. Core Principles

1. Build reusable patterns, not page-specific shortcuts.
2. Separate low-level UI from domain logic.
3. Prefer composition over giant components.
4. Every interactive component must define all key states.
5. Admin components must optimize for scanability and speed.

---

## 3. Component Hierarchy

### Foundation primitives
- Box
- Stack
- Inline
- Grid
- Surface
- Text
- Heading
- Icon
- Divider

### Core UI components
- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Tabs
- Badge
- Tooltip
- Modal
- Drawer
- Dropdown
- Toast
- Pagination
- Card
- Table
- Avatar
- Skeleton

### Admin-specific patterns
- PageHeader
- FilterToolbar
- SearchInput
- DataTableToolbar
- KPIStatCard
- StatusBadge
- EmptyState
- ErrorState
- ConfirmDialog
- SideDetailPanel
- FormSection
- SectionCard

---

## 4. Standard Component Contract

Each component should define:
- purpose
- props
- variants
- sizes
- slots
- states
- accessibility behavior
- responsive behavior
- motion behavior if interactive

---

## 5. Naming Rules

### Variants
Use only approved names:
- `primary`
- `secondary`
- `ghost`
- `outline`
- `danger`
- `success`
- `warning`
- `link`

### Sizes
- `sm`
- `md`
- `lg`

### States
- default
- hover
- focus
- active
- selected
- disabled
- loading
- error
- success

---

## 6. Button Patterns

Buttons should communicate action priority clearly.

### Usage
- `primary`: the main action of a section or page
- `secondary`: supporting actions
- `ghost` / `outline`: lower-emphasis actions
- `danger`: destructive actions only

### Rules
- loading state must not shift layout
- focus ring must be visible
- icons must align consistently
- avoid too many primary buttons in one zone

---

## 7. Input Patterns

All form controls should follow a unified structure:
- label
- control
- helper/error text

### Rules
- labels must be explicit
- required/optional status must be clear
- focus state must be strong
- errors must be readable and consistent
- disabled state must remain legible

---

## 8. Card Patterns

Cards are used for grouping, not decoration.

### Allowed card roles
- KPI summary
- configuration section
- entity summary
- analytics container
- detail block

### Rules
- cards should have predictable padding
- headers and actions should align consistently
- hover elevation only for interactive cards
- avoid marketing-style card treatments

---

## 9. Table Patterns

Tables are first-class admin components.

### Must support when relevant
- sortable columns
- filter integration
- row selection
- row actions
- loading state
- empty state
- pagination
- sticky header when useful

### Rules
- prioritize readability over visual novelty
- row hover should be subtle but visible
- selected rows must be clearly differentiated
- actions must not create visual clutter

---

## 10. Modal and Drawer Patterns

Use modals/drawers for focused tasks only.

### Structure
- header
- body
- footer

### Use modal for
- confirmations
- compact forms
- focused review/edit tasks

### Use drawer for
- contextual detail inspection
- secondary edit flows
- side-task interactions

### Rules
- overlay should feel calm and not too dark
- transitions must be short and smooth
- close behavior must be predictable

---

## 11. Badge and Status Patterns

Status meaning must stay consistent system-wide.

### Semantic mapping
- success = active, completed, approved, healthy
- warning = pending, waiting, attention needed
- danger = failed, cancelled, blocked, destructive
- neutral = draft, inactive, unknown

Do not remap colors per page or per module.

---

## 12. Form Patterns

### Structure
- page header or section title
- grouped form sections
- clear validation placement
- stable action bar

### Rules
- long forms must be sectioned
- destructive actions must be visually separated
- helper text should be concise
- validation must appear in a consistent position
- submit/cancel actions must be predictable

---

## 13. Admin Page Utility Patterns

### FilterToolbar
Supports:
- search
- filters
- sort
- date range
- reset
- export/import actions

### KPIStatCard
Supports:
- label
- primary number
- delta/trend
- contextual note
- optional icon

### SideDetailPanel
Supports:
- title
- status
- summary metadata
- actions
- related sections

---

## 14. Motion Patterns

Use motion to support clarity, not delight for its own sake.

### Approved motions
- hover lift on cards/buttons
- fade/translate for overlays
- content reveal for expandable areas
- smooth filter result transitions
- subtle page/section entry

### Avoid
- bounce effects
- exaggerated slide distances
- looping decorative motion in task-heavy screens

---

## 15. Responsive Patterns

Components must define responsive behavior explicitly.

Examples:
- toolbar wraps into stacked controls
- table may collapse into card list on small screens
- side panel may become drawer
- button groups may collapse to menu

---

## 16. Accessibility Rules

Every interactive component must support:
- keyboard access
- visible focus state
- semantic roles where needed
- strong contrast
- clear disabled and error state

Reduced-motion preferences must be respected.

---

## 17. Anti-Patterns

Do not:
- create one-off button/input variants per page
- hardcode spacing or radius inside feature code
- make cards look like marketing content
- over-animate CRUD surfaces
- mix base UI with business logic deeply
- duplicate existing patterns with minor visual changes

---

## 18. Definition of Done

A component is complete only when it has:
- token-based styling
- documented variants and states
- accessibility behavior
- responsive behavior
- clean API
- admin-appropriate motion
