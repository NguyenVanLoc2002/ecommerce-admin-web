# 3d-guidelines.md

## 1. Purpose

This document defines whether and how 3D should be used in `admin-web`.

Default position:
**3D is optional and generally not recommended for core admin workflows.**

---

## 2. Role of 3D in Admin

The admin is an operational system.
Its priority is:
- clarity
- speed
- control
- readability

Because of that, 3D should only appear as a limited enhancement in rare cases.

---

## 3. Acceptable Use Cases

3D may be acceptable for:
- premium empty-state illustration
- optional dashboard hero illustration
- product-preview visualization when directly useful
- onboarding or marketing-like internal overview screens

These uses must remain secondary to task completion.

---

## 4. Not Recommended

Do not use 3D in:
- tables
- forms
- settings
- CRUD pages
- list pages
- dense operational dashboards
- permission/security flows
- repetitive daily workflows

---

## 5. Performance Rules

If 3D is used:
- lazy-load it
- provide fallback static visuals
- keep scene complexity low
- avoid blocking first meaningful content
- avoid heavy continuous animation
- test on lower-powered laptops

---

## 6. Interaction Rules

3D must never:
- be required to understand critical information
- hide important controls
- compete with data-heavy UI
- create unpredictable movement near actionable UI

3D should remain decorative or supplementary.

---

## 7. Visual Style Rules

If present, admin 3D should feel:
- minimal
- calm
- low-contrast relative to main content
- aligned with the platform’s neutral visual language

Avoid:
- shiny gaming-style objects
- aggressive lighting
- vivid neon materials
- constant rotating objects near work surfaces

---

## 8. Motion Rules for 3D

If animated:
- keep movement slow and subtle
- prefer ambient drift over attention-seeking loops
- pause or minimize when out of focus if possible
- respect reduced-motion preferences

---

## 9. Implementation Guidance

Preferred strategy:
- isolate 3D into a dedicated presentational component
- keep business logic outside the scene
- expose a simple API to the page
- ensure graceful degradation when WebGL or performance is poor

---

## 10. Approval Standard

Before adding 3D to admin, ask:
1. Does this improve user understanding?
2. Is this directly relevant to the workflow?
3. Can the same goal be achieved with 2D more clearly?
4. Will this slow down the page or distract operators?

If the answer is uncertain, do not use 3D.

---

## 11. Final Rule

For `admin-web`, 3D is the exception, not the visual language.
