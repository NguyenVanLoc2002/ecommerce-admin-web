# page-blueprints.md

## 1. Purpose

This document defines page-level blueprint patterns for `admin-web`.

Blueprints ensure consistency in:
- structure
- hierarchy
- spacing
- action placement
- page state handling

These are implementation templates, not fixed mockups.

---

## 2. Shared Page Principles

1. The page purpose must be obvious at first glance.
2. Header, controls, and primary content must follow predictable placement.
3. Repeated page types must reuse repeated structures.
4. States like loading, empty, and error must be planned from the start.
5. Decorative styling must never compete with task completion.

---

## 3. Standard Page Anatomy

Most admin pages should use:
1. page shell
2. page header
3. context controls / toolbar
4. main content zone
5. supporting zone if needed
6. page states

---

## 4. Dashboard Blueprint

### Use for
- overview metrics
- operational health
- activity summary
- quick insight screens

### Structure
1. page header
2. KPI row
3. analytics / trend row
4. alerts or exceptions row
5. recent activity / quick actions row

### Rules
- critical metrics must appear above the fold
- charts must be readable before they are beautiful
- alert content must stand out clearly
- layout should feel balanced, not crowded

---

## 5. Resource List Blueprint

### Use for
- products
- categories
- orders
- users
- roles
- promotions

### Structure
1. page header
2. filter/search/sort toolbar
3. optional bulk action bar
4. table or responsive list
5. pagination
6. empty/loading/error state

### Rules
- search and filters must feel integrated
- bulk actions must appear only when relevant
- empty state should suggest next action
- row actions must be discoverable but not noisy

---

## 6. Resource Detail Blueprint

### Use for
- order detail
- product detail
- user detail
- campaign detail

### Structure
1. page header with status and actions
2. summary block
3. sectioned detail content
4. related records / history
5. support panel or side metadata if needed

### Rules
- place key facts first
- group information by meaning
- separate risky actions from primary actions
- do not create long unstructured detail walls

---

## 7. Create/Edit Form Blueprint

### Structure
1. page header
2. form sections
3. optional side summary/preview
4. stable action footer or sticky action area
5. validation/error messaging

### Rules
- long forms must be broken into logical sections
- labels and helper text must be consistent
- save/cancel placement must remain predictable
- destructive actions must remain visually separate

---

## 8. Settings Blueprint

### Structure
1. page header
2. grouped settings sections
3. optional side navigation for large settings areas
4. save/action area
5. feedback state

### Rules
- group by user mental model, not backend grouping
- dangerous settings must be isolated visually
- explanations should be concise and useful

---

## 9. Detail + Side Panel Blueprint

### Use for
- entity review pages
- operational inspection flows
- support and audit screens

### Structure
1. page header
2. main detail content
3. right summary/action panel
4. history or related records below

### Rules
- side panel must remain secondary
- page should still work responsively when side panel stacks
- summary panel should emphasize status and quick actions

---

## 10. Empty, Loading, Error States

Every blueprint must define:
- loading state
- empty state
- error state
- partial-data state where relevant

### Empty state should include
- title
- short explanation
- next action if relevant

### Loading state should prefer
- skeletons for structured content
- subtle inline loaders for small actions

---

## 11. Page Header Pattern

Supports:
- breadcrumb
- title
- subtitle
- status badge
- primary action
- secondary actions

Rules:
- use the same visual pattern across comparable page types
- do not overload the header with too many actions

---

## 12. Toolbar Pattern

Supports:
- search
- filter controls
- sort controls
- date range
- reset action
- import/export actions

Rules:
- the toolbar must not become visually chaotic
- collapse low-priority controls on smaller screens

---

## 13. Responsive Rules

Admin pages must explicitly adapt:
- tables to responsive patterns when needed
- side panels to stacked layout or drawer
- toolbars to wrapped or collapsed controls
- card rows to sensible breakpoints

No page should rely on accidental wrapping.

---

## 14. Motion Guidance at Page Level

Use:
- subtle section reveal
- route/page intro fade
- stable content replacement for filters/tabs
- smooth panel transitions

Avoid:
- dramatic route changes
- decorative motion competing with data
- animation that slows repetitive work

---

## 15. Final Rule

An admin page is successful when it:
- communicates the task clearly
- supports fast scanning
- keeps actions predictable
- stays visually consistent with the rest of the product
