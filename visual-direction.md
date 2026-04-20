# visual-direction.md

## 1. Purpose

This file defines the visual identity for `admin-web`.

The admin experience must feel:
- modern
- structured
- reliable
- premium but restrained
- efficient for daily operations

This document is the visual source of truth for page atmosphere, layout discipline, hierarchy, motion tone, and depth treatment.

---

## 2. Product Expression

`admin-web` is a productivity interface for managing the ecommerce platform.
It must prioritize:
- operational clarity
- speed of scanning
- predictable actions
- information grouping
- consistent workflow patterns

The UI should never feel noisy, gimmicky, or visually overloaded.

---

## 3. Design Philosophy

### Core principles
1. **Clarity over decoration**
   - Information must be immediately understandable.
   - Decorative elements must never compete with data or controls.

2. **Consistency over novelty**
   - Repeated patterns should look and behave the same across modules.
   - Similar page types must share the same visual structure.

3. **Calm sophistication**
   - The admin should feel polished and premium through spacing, hierarchy, and motion, not flashy styling.

4. **Motion with purpose**
   - Motion should support understanding, state change, and responsiveness.
   - Motion must remain subtle in data-heavy and workflow-heavy areas.

5. **Depth without distraction**
   - Use light shadow, layered surfaces, and selective blur where helpful.
   - Avoid excessive glassmorphism or heavy visual effects.

---

## 4. Visual Keywords

Use these keywords to guide implementation:
- clean
- structured
- professional
- premium
- calm
- layered
- precise
- readable
- efficient
- trustworthy

Avoid:
- playful consumer-style visuals
- overly bright gradients
- neon effects
- decorative clutter
- exaggerated motion
- card styles that feel like marketing banners

---

## 5. Layout Direction

### Page character
Admin pages should feel grid-aligned and operational.

### Rules
- Prefer clear page containers and section boundaries.
- Use a predictable page header pattern.
- Keep major actions visible and logically grouped.
- Tables, forms, and cards should align to a consistent spacing rhythm.
- Dense content is acceptable only when readability remains strong.

### Preferred patterns
- sidebar + content shell
- toolbar + table
- KPI row + analytics row + activity row
- multi-section forms
- summary panel + detail panel

---

## 6. Surface and Depth Style

### Surface approach
Use a primarily neutral UI foundation:
- canvas background
- surface cards
- elevated surface for overlays and floating panels
- subtle hover surfaces

### Depth approach
Depth should come from:
- soft shadows
- clean borders
- slight surface contrast
- occasional blur in overlays

Avoid:
- heavy translucency
- strong glow
- layered effects that reduce contrast

---

## 7. Color Direction

### Base strategy
- Neutrals should carry most of the UI.
- Brand color should guide actions, active states, and emphasis.
- Semantic colors should be reserved for status and feedback.

### Guidelines
- Success: confirmations, completed states, healthy metrics
- Warning: pending or attention-needed states
- Danger: destructive actions, failures, cancellation
- Info: contextual guidance only if needed

Do not use saturated colors as large admin background fills.

---

## 8. Typography Direction

Typography should communicate:
- control
- confidence
- readability
- modernity

### Rules
- Headings should be concise and clearly hierarchical.
- Body text must stay highly legible.
- Table text and metadata should be readable at scale.
- Numeric data must be stable and easy to scan.
- Use weight and spacing for hierarchy before adding more color.

---

## 9. Shape Language

### Corners
- Use rounded corners consistently.
- Controls should feel modern but not overly soft.
- Cards and modals can use larger radii than dense controls.

### Borders
- Borders should be subtle and systematic.
- Dividers should separate content quietly.
- Avoid high-contrast lines everywhere.

---

## 10. Component Feel

Components should feel:
- responsive
- clear
- precise
- tactile
- balanced

### Buttons
- Strong hierarchy between primary and secondary actions
- Minimal visual noise
- Clear hover/press/focus states

### Inputs
- Calm by default
- Clearly active on focus
- Error states must be obvious without becoming visually aggressive

### Cards
- Used for grouping and sectioning
- Never feel promotional
- Hover only when interactive

### Tables
- Optimized for scanability
- Row states must be clear
- Sorting/filtering actions should feel integrated, not bolted on

---

## 11. Motion Direction

### Motion style
Use:
- soft fade
- short translate
- subtle scale
- restrained hover lift
- fast state transitions

### Motion goals
- confirm interaction
- explain appearing/disappearing content
- preserve spatial continuity
- reduce perceived latency

### Avoid
- bounce-heavy transitions
- long parallax movement
- animated backgrounds in work areas
- dramatic page transitions

---

## 12. 3D Direction

3D is **not a core visual language** for admin-web.

### Allowed only in rare cases
- dashboard illustration blocks
- empty-state visual enhancements
- product-preview widgets if directly relevant

### Not suitable for
- tables
- forms
- settings screens
- CRUD workflows
- high-frequency operator actions

Default position: use no 3D unless there is a clear product reason.

---

## 13. Accessibility Expectations

- Strong contrast on text and controls
- Clear focus rings on all keyboard-reachable elements
- Motion must respect reduced-motion preferences
- Important states must not rely on color alone
- Dense layouts must still remain readable

---

## 14. Final Standard

A good admin screen should feel:
- immediately understandable
- visually consistent with the rest of the platform
- modern without trying too hard
- polished without being decorative
- fast and confident in day-to-day use

When in doubt:
- choose readability
- choose consistency
- choose restraint
