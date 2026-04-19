# design-tokens.md

## 1. Purpose

This file defines the token system for `admin-web`.
All visual implementation must consume tokens instead of hardcoded values.

The token system must support:
- consistency across modules
- predictable scaling
- easy theming
- reusable components
- clean design-system governance

---

## 2. Token Principles

1. Do not hardcode UI values in page code unless truly necessary.
2. Prefer semantic tokens over raw primitives in component styling.
3. Reuse before adding new tokens.
4. Keep token names stable and scalable.
5. Optimize tokens for operational UI first.

---

## 3. Token Layers

### Primitive tokens
Raw values:
- color scales
- spacing scale
- radius scale
- font sizes
- motion durations
- shadows

### Semantic tokens
Meaning-based values:
- background
- text
- border
- action
- state
- surface

### Component tokens
Component-specific mappings:
- button
- input
- card
- table
- modal
- sidebar
- badge

---

## 4. Color Tokens

### Primitive palettes
Define the following scales:
- `color.neutral.0 ... 1000`
- `color.brand.50 ... 900`
- `color.success.50 ... 900`
- `color.warning.50 ... 900`
- `color.danger.50 ... 900`
- `color.info.50 ... 900` (optional)

### Semantic background tokens
- `bg.canvas`
- `bg.surface`
- `bg.surface-elevated`
- `bg.surface-hover`
- `bg.surface-active`
- `bg.subtle`
- `bg.overlay`
- `bg.brand-subtle`
- `bg.success-subtle`
- `bg.warning-subtle`
- `bg.danger-subtle`

### Semantic text tokens
- `text.primary`
- `text.secondary`
- `text.tertiary`
- `text.inverse`
- `text.brand`
- `text.success`
- `text.warning`
- `text.danger`
- `text.disabled`

### Semantic border tokens
- `border.default`
- `border.subtle`
- `border.strong`
- `border.focus`
- `border.brand`
- `border.success`
- `border.warning`
- `border.danger`

### Action tokens
- `action.primary.bg`
- `action.primary.fg`
- `action.primary.border`
- `action.primary.hover`
- `action.primary.active`

- `action.secondary.bg`
- `action.secondary.fg`
- `action.secondary.border`
- `action.secondary.hover`
- `action.secondary.active`

- `action.ghost.bg`
- `action.ghost.fg`
- `action.ghost.hover`
- `action.ghost.active`

- `action.danger.bg`
- `action.danger.fg`
- `action.danger.hover`

### State tokens
- `state.success.bg`
- `state.success.fg`
- `state.success.border`
- `state.warning.bg`
- `state.warning.fg`
- `state.warning.border`
- `state.danger.bg`
- `state.danger.fg`
- `state.danger.border`
- `state.info.bg`
- `state.info.fg`
- `state.info.border`

---

## 5. Typography Tokens

### Font families
- `font.family.sans`
- `font.family.heading`
- `font.family.mono`

### Font sizes
- `font.size.xs`
- `font.size.sm`
- `font.size.md`
- `font.size.lg`
- `font.size.xl`
- `font.size.2xl`
- `font.size.3xl`
- `font.size.4xl`

### Font weights
- `font.weight.regular`
- `font.weight.medium`
- `font.weight.semibold`
- `font.weight.bold`

### Line heights
- `font.line-height.tight`
- `font.line-height.normal`
- `font.line-height.relaxed`

### Semantic typography
- `type.page-title`
- `type.section-title`
- `type.card-title`
- `type.body`
- `type.body-sm`
- `type.label`
- `type.caption`
- `type.metric`
- `type.table`
- `type.code`

Admin typography should favor legibility over stylistic expression.

---

## 6. Spacing Tokens

Use a shared rhythm based on 8px with micro-step support.

Define:
- `space.0`
- `space.1`
- `space.2`
- `space.3`
- `space.4`
- `space.5`
- `space.6`
- `space.8`
- `space.10`
- `space.12`
- `space.16`
- `space.20`
- `space.24`

Semantic layout tokens:
- `layout.page-padding`
- `layout.section-gap`
- `layout.card-padding`
- `layout.form-gap`
- `layout.table-toolbar-gap`
- `layout.grid-gap`

---

## 7. Radius Tokens

Define:
- `radius.none`
- `radius.sm`
- `radius.md`
- `radius.lg`
- `radius.xl`
- `radius.2xl`
- `radius.full`

Guidance:
- controls: `sm` / `md`
- buttons: `md` / `lg`
- cards: `lg`
- modal/drawer: `xl`

---

## 8. Border Tokens

### Widths
- `border.width.none`
- `border.width.thin`
- `border.width.default`
- `border.width.strong`

### Usage
Use semantic border tokens in implementation.
Do not mix random border opacity and widths across components.

---

## 9. Shadow Tokens

Define:
- `shadow.xs`
- `shadow.sm`
- `shadow.md`
- `shadow.lg`

Semantic elevation:
- `elevation.surface`
- `elevation.hover`
- `elevation.overlay`
- `elevation.modal`

Admin shadow style must stay soft and restrained.

---

## 10. Motion Tokens

### Durations
- `motion.duration.instant`
- `motion.duration.fast`
- `motion.duration.normal`
- `motion.duration.slow`

### Easing
- `motion.ease.standard`
- `motion.ease.enter`
- `motion.ease.exit`
- `motion.ease.emphasized`

### Distances
- `motion.distance.sm`
- `motion.distance.md`
- `motion.distance.lg`

### Scales
- `motion.scale.hover`
- `motion.scale.press`
- `motion.scale.enter`

Admin default motion should use fast to normal timing only.

---

## 11. Z-Index Tokens

- `z.base`
- `z.dropdown`
- `z.sticky`
- `z.overlay`
- `z.modal`
- `z.toast`
- `z.tooltip`

No arbitrary z-index values in feature code.

---

## 12. Breakpoint Tokens

- `breakpoint.xs`
- `breakpoint.sm`
- `breakpoint.md`
- `breakpoint.lg`
- `breakpoint.xl`
- `breakpoint.2xl`

---

## 13. Layout Tokens

- `layout.page.max-width`
- `layout.content.max-width`
- `layout.sidebar.width`
- `layout.sidebar.collapsed-width`
- `layout.header.height`
- `layout.toolbar.height`
- `layout.container.padding-x`
- `layout.section.gap`

---

## 14. Component Token Groups

### Button
- height
- padding
- radius
- typography
- bg
- fg
- border
- hover
- active
- disabled
- loading
- focus-ring

### Input
- height
- padding
- radius
- bg
- text
- placeholder
- border
- hover
- focus
- error
- disabled

### Card
- bg
- border
- radius
- padding
- shadow
- hover-shadow
- selected-border

### Table
- header-bg
- row-bg
- row-hover-bg
- row-selected-bg
- border
- cell-padding
- row-height

### Modal
- overlay-bg
- bg
- radius
- shadow
- header-padding
- body-padding
- footer-padding

### Sidebar
- bg
- border
- item-height
- item-radius
- item-hover-bg
- item-active-bg
- item-active-fg

---

## 15. Dark Mode Readiness

Even if not implemented now:
- semantic token names must remain stable
- raw primitive values may change per theme
- components must consume semantic tokens only

---

## 16. Governance Rules

Before adding a token, ask:
1. Is this reusable?
2. Is there already a semantic equivalent?
3. Does this help system consistency?
4. Is this token admin-appropriate rather than decorative?

Consistency is more important than one-off screen polish.
