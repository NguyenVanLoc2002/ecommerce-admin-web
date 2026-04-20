# motion-guidelines.md

## 1. Purpose

This document defines motion principles for `admin-web`.

Motion in the admin must support:
- clarity
- feedback
- hierarchy
- perceived responsiveness

Motion is a functional layer, not a decorative layer.

---

## 2. Motion Philosophy

Admin motion should feel:
- subtle
- fast
- precise
- calm
- premium

It should never feel:
- playful
- bouncy
- dramatic
- distracting

---

## 3. Core Motion Principles

1. Motion must explain change.
2. Motion must not slow down repeated workflows.
3. Motion should preserve spatial continuity.
4. Similar interactions must use similar motion.
5. Reduced-motion preferences must be respected.

---

## 4. Approved Motion Types

### Micro-interactions
Use for:
- button hover
- button press
- input focus transition
- toggle change
- tab switch
- row hover

### Reveal/hide motion
Use for:
- dropdown
- accordion
- filter panel
- side panel
- contextual actions

### Overlay motion
Use for:
- modal
- drawer
- popover
- confirmation dialog

### Content transition
Use for:
- filter changes
- sorting updates
- section loading completion
- route-level page intro

---

## 5. Motion Style

Preferred effects:
- fade
- small translate
- small scale
- subtle elevation change
- opacity transition

Avoid:
- bounce
- elastic motion
- exaggerated zoom
- long sliding distances
- spinning decorative effects in productive workflows

---

## 6. Timing Guidance

### Fast
Use for:
- hover
- press
- icon state changes
- focus changes

### Normal
Use for:
- dropdowns
- drawers
- modals
- section reveal

### Slow
Use rarely.
Admin default should stay in fast/normal range.

---

## 7. Easing Guidance

Use smooth and restrained easings.

Recommended categories:
- standard easing for most transitions
- enter easing for appearing surfaces
- exit easing for dismissing surfaces
- emphasized easing only for major overlays, sparingly

Avoid spring-like motion unless there is a strong reason.

---

## 8. Component-Level Rules

### Buttons
- hover: small elevation or opacity shift
- press: small scale-down or deeper active state
- loading: preserve width, no jump

### Inputs
- focus: border/ring transition should be smooth and quick
- error appearance: visible but not aggressive

### Cards
- interactive cards may lift slightly on hover
- non-interactive cards should stay still

### Tables
- row hover should be subtle
- sorting/filtering updates should feel responsive, not animated for spectacle

### Modals and drawers
- backdrop fades in/out
- content uses short fade + slight translate/scale
- exit must be faster than entry

---

## 9. Page-Level Rules

### Allowed
- short page intro on route change
- section reveal on dashboard load
- content replacement transitions when filters update

### Avoid
- large route transitions
- full-page parallax
- animated backgrounds
- multiple simultaneous attention-grabbing motions

---

## 10. Loading Motion

Prefer:
- skeleton shimmer
- subtle inline spinner
- minimal progress motion

Avoid:
- flashy loaders
- long looping animations that dominate the screen

---

## 11. State Change Motion

Motion should help users understand:
- an action succeeded
- a row expanded
- content updated
- a panel opened
- a filter was applied

When state changes are critical, combine motion with clear visual state changes.

---

## 12. Reduced Motion

Must support reduced-motion mode.

In reduced-motion mode:
- remove non-essential transitions
- reduce travel distance
- avoid scale-based theatrics
- preserve only immediate state feedback where needed

---

## 13. Anti-Patterns

Do not:
- animate every card on page load
- use bouncy dashboards
- delay data visibility with long intros
- animate tables aggressively
- animate background effects behind complex workflows

---

## 14. Final Rule

If motion does not improve understanding or responsiveness, remove it.
