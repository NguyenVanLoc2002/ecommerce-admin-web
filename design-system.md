# Design System — Fashion Shop Admin Web

> Implementation-ready design reference. All UI is built with Tailwind CSS + `cva`. No custom CSS unless unavoidable.

---

## 1. Visual Direction

Clean, functional admin aesthetic. High information density with clear visual hierarchy. Whitespace is used for grouping, not decoration.

- **Tone**: professional, efficient, minimal
- **Primary audience**: internal staff on desktop (1280px+)
- **Color mood**: neutral base with clear semantic color signals
- **Typography**: system font stack for performance

---

## 2. Color Roles

Define semantic aliases in `tailwind.config.ts`. Use these tokens everywhere — never hardcode hex.

### 2.1 Tailwind Config Semantic Colors

```ts
// tailwind.config.ts
colors: {
  primary: {
    50:  '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  success: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50:  '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    50:  '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50:  '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
  },
}
```

### 2.2 Color Role Reference

| Role | Tailwind Token | Usage |
|---|---|---|
| Page background | `bg-gray-50` | App shell background |
| Surface (card, panel) | `bg-white` | Cards, tables, modals |
| Border | `border-gray-200` | Dividers, card borders |
| Border strong | `border-gray-300` | Input borders |
| Text primary | `text-gray-900` | Body text, headings |
| Text secondary | `text-gray-500` | Labels, captions |
| Text disabled | `text-gray-400` | Disabled inputs, placeholders |
| Text on dark | `text-white` | Button labels on colored bg |
| Primary action | `bg-primary-600` | Primary buttons, links |
| Primary hover | `bg-primary-700` | Primary button hover |
| Danger action | `bg-danger-600` | Delete, void, reject |
| Success | `bg-success-600` | Approve, complete, paid |
| Warning | `bg-warning-500` | Warnings, amber badges |
| Info | `bg-info-500` | Informational badges |
| Sidebar bg | `bg-gray-900` | Sidebar background |
| Sidebar text | `text-gray-300` | Sidebar nav items |
| Sidebar active | `bg-gray-800 text-white` | Active nav item |

---

## 3. Typography

No custom fonts in Phase 1. Use the system font stack.

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
}
```

### 3.1 Type Scale

| Name | Tailwind Classes | Usage |
|---|---|---|
| Page title | `text-2xl font-semibold text-gray-900` | H1 on page header |
| Section heading | `text-lg font-semibold text-gray-900` | Card/section headers |
| Subsection | `text-base font-medium text-gray-900` | Sub-headings |
| Body | `text-sm text-gray-700` | Table cells, form labels, body text |
| Caption / label | `text-xs text-gray-500` | Table column headers, field hints |
| Code / business ID | `text-sm font-mono text-gray-800` | Order codes, SKUs, tracking numbers |

### 3.2 Rules

- Use `font-semibold` for headings; `font-medium` for labels; `font-normal` for body.
- Business codes (order codes, payment codes, SKUs) always render in `font-mono`.
- Truncate long text in table cells with `truncate` + `max-w-[...]` + `title` attribute for tooltip.

---

## 4. Spacing Scale

Use Tailwind's default 4px-base scale. Standard gaps for layout:

| Usage | Value | Class |
|---|---|---|
| Page horizontal padding | 24px | `px-6` |
| Page vertical padding | 24px | `py-6` |
| Card padding | 24px | `p-6` |
| Section gap | 24px | `gap-6` |
| Form field gap | 16px | `gap-4` |
| Inline element gap | 8px | `gap-2` |
| Table cell padding | 12px 16px | `py-3 px-4` |
| Sidebar width | 256px | `w-64` |
| Topbar height | 64px | `h-16` |

---

## 5. Border Radius

| Element | Value | Class |
|---|---|---|
| Card / panel | 8px | `rounded-lg` |
| Button | 6px | `rounded-md` |
| Input | 6px | `rounded-md` |
| Badge | full | `rounded-full` |
| Modal | 12px | `rounded-xl` |
| Tooltip | 4px | `rounded` |
| Avatar | full | `rounded-full` |

---

## 6. Shadows

| Level | Class | Usage |
|---|---|---|
| None | — | Default state for cards (use border instead) |
| Low | `shadow-sm` | Dropdowns, tooltips |
| Medium | `shadow-md` | Modals, drawers |
| High | `shadow-lg` | Floating panels, popovers |

Prefer `border border-gray-200` for cards over shadows. Shadows for floating/overlay elements only.

---

## 7. UI Primitives

### 7.1 Button

Variants via `cva`. All variants use `rounded-md`, `font-medium`, `transition-colors`, `focus-visible:ring-2`.

| Variant | Base classes |
|---|---|
| `primary` | `bg-primary-600 text-white hover:bg-primary-700` |
| `secondary` | `bg-white text-gray-700 border border-gray-300 hover:bg-gray-50` |
| `destructive` | `bg-danger-600 text-white hover:bg-danger-700` |
| `ghost` | `text-gray-600 hover:bg-gray-100` |
| `link` | `text-primary-600 hover:underline p-0 h-auto` |

| Size | Classes |
|---|---|
| `sm` | `h-8 px-3 text-xs` |
| `md` | `h-9 px-4 text-sm` |
| `lg` | `h-10 px-5 text-sm` |

**Loading state**: `isLoading` prop → shows spinner + disables button. Label changes to "Saving…" for submit buttons.

**Disabled**: `opacity-50 cursor-not-allowed pointer-events-none`.

### 7.2 Input

```
border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900
placeholder:text-gray-400
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
```

Error state: `border-danger-500 focus:ring-danger-500`

### 7.3 Select

Same visual as Input. Adds a dropdown chevron icon via CSS or custom wrapper.

### 7.4 Textarea

Same as Input. `resize-y min-h-[80px]`.

### 7.5 Checkbox

```
h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500
```

### 7.6 Toggle / Switch

Pill-shaped toggle. Off: `bg-gray-200`. On: `bg-primary-600`. Knob slides with `transition-transform`.

### 7.7 Badge

Pill-shaped, small, used for statuses. Always `rounded-full text-xs font-medium px-2.5 py-0.5`.

### 7.8 Tooltip

`bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-sm`. Max width 200px. 200 ms delay before show.

### 7.9 Divider

`border-t border-gray-200` (horizontal) or `border-l border-gray-200` (vertical).

---

## 8. Layout Components

### 8.1 AdminLayout

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (w-64, bg-gray-900, fixed)  │  Top bar     │
│                                      │  (h-16)      │
│  Logo                                ├──────────────┤
│  ─────                               │              │
│  Nav items                           │  Page area   │
│    > Dashboard                       │  (flex-1,    │
│    > Products                        │   overflow-  │
│    > Orders                          │   auto,      │
│    > ...                             │   p-6)       │
│                                      │              │
│  User avatar + name (bottom)         │              │
└─────────────────────────────────────────────────────┘
```

### 8.2 Sidebar Nav Item

Active state: `bg-gray-800 text-white rounded-md`.
Hover state: `hover:bg-gray-800 hover:text-white`.
Inactive: `text-gray-400`.

Icon + label layout: `flex items-center gap-3 px-3 py-2`.

### 8.3 PageHeader

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
  </div>
  <div className="flex items-center gap-3">{actions}</div>
</div>
```

### 8.4 Card

```
bg-white border border-gray-200 rounded-lg p-6
```

---

## 9. Status Badge System

Use `<StatusBadge>` component from `shared/components/ui/`. Accepts a `status` prop; maps to color automatically.

### 9.1 Order Status

| Status | Color | Classes |
|---|---|---|
| `PENDING` | Amber | `bg-warning-100 text-warning-700` |
| `AWAITING_PAYMENT` | Amber | `bg-warning-100 text-warning-700` |
| `CONFIRMED` | Blue | `bg-info-100 text-info-700` |
| `PROCESSING` | Blue | `bg-info-100 text-info-700` |
| `SHIPPED` | Blue | `bg-primary-100 text-primary-700` |
| `DELIVERED` | Green | `bg-success-100 text-success-700` |
| `COMPLETED` | Green | `bg-success-100 text-success-700` |
| `CANCELLED` | Red | `bg-danger-100 text-danger-700` |
| `REFUNDED` | Gray | `bg-gray-100 text-gray-600` |

### 9.2 Payment Status

| Status | Color | Classes |
|---|---|---|
| `PENDING` | Amber | `bg-warning-100 text-warning-700` |
| `INITIATED` | Blue | `bg-info-100 text-info-700` |
| `PAID` | Green | `bg-success-100 text-success-700` |
| `FAILED` | Red | `bg-danger-100 text-danger-700` |
| `REFUNDED` | Gray | `bg-gray-100 text-gray-600` |
| `PARTIALLY_REFUNDED` | Gray | `bg-gray-100 text-gray-600` |

### 9.3 Shipment Status

| Status | Color | Classes |
|---|---|---|
| `PENDING` | Gray | `bg-gray-100 text-gray-600` |
| `IN_TRANSIT` | Blue | `bg-info-100 text-info-700` |
| `OUT_FOR_DELIVERY` | Amber | `bg-warning-100 text-warning-700` |
| `DELIVERED` | Green | `bg-success-100 text-success-700` |
| `FAILED` | Red | `bg-danger-100 text-danger-700` |
| `RETURNED` | Red | `bg-danger-100 text-danger-700` |

### 9.4 Review Status

| Status | Color | Classes |
|---|---|---|
| `PENDING` | Amber | `bg-warning-100 text-warning-700` |
| `APPROVED` | Green | `bg-success-100 text-success-700` |
| `REJECTED` | Red | `bg-danger-100 text-danger-700` |

### 9.5 Product Status

| Status | Color | Classes |
|---|---|---|
| `DRAFT` | Gray | `bg-gray-100 text-gray-600` |
| `PUBLISHED` | Green | `bg-success-100 text-success-700` |
| `ARCHIVED` | Gray | `bg-gray-200 text-gray-500` |

### 9.6 Invoice Status

| Status | Color | Classes |
|---|---|---|
| `ISSUED` | Blue | `bg-info-100 text-info-700` |
| `PAID` | Green | `bg-success-100 text-success-700` |
| `VOIDED` | Red | `bg-danger-100 text-danger-700` |

---

## 10. Table UX Rules

Applied to every admin list screen. Reference `shared/components/table/DataTable.tsx`.

### 10.1 Toolbar Layout

```
[ Search input            ] [ Filter ▾ ] [ Columns ▾ ]       [ + New ]
[ chip: Status=PENDING × ] [ chip: Method=COD × ]  [ Reset filters ]
─────────────────────────────────────────────────────────────────────
[ ☐ ] Col A ↕   Col B ↕   Col C ↕   ...                    Actions
─────────────────────────────────────────────────────────────────────
  Showing 1–20 of 347                              [ < 1 2 3… > ] [20▾]
```

### 10.2 Rules

- **Sorting**: click column header to toggle asc/desc. Show `↑` or `↓` next to active sort column. One sort at a time.
- **Filter panel**: opens as side drawer. Active filters show as dismissible chips below toolbar. "Reset filters" clears all and re-runs query.
- **Search debounce**: 300 ms before firing. Show spinner inside input while in-flight.
- **Filter state**: always synced to URL search params.
- **Page size**: options 10 / 20 / 50 / 100. Default 20. Persisted in `localStorage`.
- **Results count**: "Showing {from}–{to} of {total} results". Updates on every change.
- **Column visibility**: dropdown of checkboxes. At least one column always visible.
- **Row actions**: primary action on hover (e.g., "View"). Secondary actions in kebab `⋯` menu. Destructive actions in kebab only.
- **Bulk selection**: checkbox per row + header checkbox (select all on page). Bulk action bar appears above table when ≥1 selected: "{n} selected | [Action A] [Deselect all]".
- **Bulk actions**: always require confirmation dialog. After action: refresh table, deselect all, show toast with count.
- **Empty state**: illustration + "No {entity} found". If filters active: show "Clear filters" CTA. If no data at all: "Create your first {entity}" CTA.
- **Loading (initial)**: `skeleton-table`. **Loading (filter/page change)**: spinner in table body, headers stay visible.
- **Error state**: inline error card inside table area with "Retry" button.

### 10.3 Skeleton Table

Show grey pulse bars matching the expected row/column layout. Shimmer animation left-to-right.

---

## 11. Form UX Rules

### 11.1 Field Layout

```
Label                          ← text-sm font-medium text-gray-700
[    Input / Select           ]← full-width input
Error message                  ← text-sm text-danger-600 mt-1 (via form.setError)
Hint text                      ← text-xs text-gray-500 mt-1 (optional)
```

Required fields: asterisk `*` next to label in `text-danger-500`.

### 11.2 Validation Timing

- Validate on `onBlur` first; then re-validate `onChange` once a field has been touched.
- Schema: define in Zod, validated via `zodResolver`.
- Field errors appear inline below the input. Red border on error: `border-danger-500 focus:ring-danger-500`.

### 11.3 Form Actions

Place submit / cancel buttons at the bottom-right of the form:

```
                          [ Cancel ]  [ Save ]
```

- Submit button: `primary` variant with `isLoading` spinner state. Disable during submission.
- Cancel button: `secondary` variant or `ghost`. Triggers dirty state check before navigating away.

### 11.4 Inline Save vs Full Page

- **Full-page forms** (create/edit product, create shipment, create promotion): use `ProductEditPage`-style layout with `PageHeader` + form card.
- **Inline modals** (create category/brand, create warehouse): use `<Modal>` with compact form.

---

## 12. Modal

```
┌────────────────────────────────────────────┐
│  Title                                ✕    │
│ ─────────────────────────────────────────  │
│  Body content                              │
│                                            │
│ ─────────────────────────────────────────  │
│                    [ Cancel ] [ Confirm ]  │
└────────────────────────────────────────────┘
```

- Max width: `max-w-lg` (default), `max-w-xl` for complex forms.
- Background overlay: `bg-black/50`.
- Close on Escape. Close on overlay click (unless destructive — require explicit cancel).
- Confirmation button is rightmost and primary/destructive colored.
- Cancel is leftmost and secondary styled.
- If confirmation requires text input (void note, reject reason): disable confirm button until filled.

### Confirmation Dialog Variants

| Action | Title | Confirm | Style |
|---|---|---|---|
| Delete product | "Remove product?" | "Remove" | `destructive` |
| Delete variant | "Delete variant?" | "Delete" | `destructive` |
| Void invoice | "Void this invoice?" + note textarea | "Void invoice" | `destructive` |
| Deactivate voucher | "Deactivate voucher?" | "Deactivate" | `destructive` |
| Reject review | "Reject this review?" + note textarea | "Reject" | `destructive` |
| Bulk approve reviews | "Approve {n} reviews?" | "Approve all" | `warning` |

---

## 13. Drawer

Used for filter panels. Slides in from the right.

```
Width: w-80 (320px)
Header: title + close button
Body: scrollable filter form
Footer: [ Reset ] [ Apply ]
```

Overlay: `bg-black/30`. Close on Escape or overlay click.

---

## 14. Toast

Position: bottom-right. Stack from bottom upward. Max 3 visible at once; queue rest.

| Type | Icon | Background | Auto-dismiss |
|---|---|---|---|
| Success | ✓ | `bg-success-600` | 4 s |
| Error | ✗ | `bg-danger-600` | No — manual dismiss |
| Warning | ⚠ | `bg-warning-500` | 6 s |
| Info | ℹ | `bg-info-500` | 4 s |

- Network timeout errors include a "Retry" action button inside the toast.
- Errors from `fieldErrors` go inline — never as toast.

---

## 15. Empty State

```
┌────────────────────────────────┐
│                                │
│     [Illustration / Icon]      │
│                                │
│     No orders found            │   ← text-sm font-medium text-gray-900
│     Try adjusting your         │   ← text-sm text-gray-500
│     filters.                   │
│                                │
│       [ Clear filters ]        │   ← secondary button (if filters active)
│       [ Create product ]       │   ← primary button (if no data at all)
│                                │
└────────────────────────────────┘
```

Centered vertically and horizontally in the table body area.

---

## 16. Skeleton

Animated `bg-gray-200` blocks with shimmer (`animate-pulse` or custom shimmer keyframes, left-to-right).

### Skeleton Variants

**skeleton-table**: full table layout — toolbar row, then N rows × M columns of grey bars.

**skeleton-detail**: header block, 2–3 section cards with field-label pairs.

**skeleton-form**: field labels + input placeholders stacked.

**skeleton-timeline**: vertical timeline — circle + bar pairs.

**skeleton-stat**: KPI card — icon placeholder, large number bar, label bar.

Rules:
- Show skeleton on initial load and hard route refresh.
- Show spinner (not skeleton) on subsequent user-triggered refreshes.
- Never show skeleton and real content simultaneously.

---

## 17. Order Status Stepper

Used on Order Detail page. Horizontal stepper showing all lifecycle stages.

```
● ────── ● ────── ● ────── ○ ────── ○ ────── ○
Placed  Confirmed Processing Shipped Delivered Completed
```

| State | Style |
|---|---|
| Completed stage | `bg-success-600` filled circle + checkmark, label `text-success-700` |
| Current stage | `bg-primary-600` pulsing ring, label `text-primary-700 font-medium` |
| Future stage | `bg-gray-200` empty circle, label `text-gray-400` |
| Cancelled / terminal | Replace stepper with a full-width red banner |

---

## 18. Event Timeline (Shipment, Audit Log)

Vertical append-only timeline. New entries at top.

```
│ ● 2026-04-18 14:32  IN_TRANSIT
│   Hanoi Hub → Ho Chi Minh City
│   Description: Departed from origin facility
│
│ ● 2026-04-18 09:15  PENDING
│   Created
```

Connector line: `border-l-2 border-gray-200 ml-2`.
Node dot: `w-3 h-3 rounded-full bg-gray-400 -ml-1.5`.
Active/latest dot: `bg-primary-600`.

---

## 19. KPI Stat Card (Dashboard)

```
┌──────────────────────────────────────┐
│  [Icon]    Orders Today              │
│                                      │
│  347                                 │← text-3xl font-bold text-gray-900
│  +12% from yesterday                 │← text-sm text-success-600
└──────────────────────────────────────┘
```

- 4px left border accent matching the metric category color.
- On API error: show `—` with a small refresh icon. Do not show error toast for dashboard cards.
- Tap/click navigates to the relevant filtered list screen.

---

## 20. Business Code Display

```tsx
<span className="font-mono text-sm text-gray-800 inline-flex items-center gap-1">
  {code}
  <CopyIcon className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer" />
</span>
```

Wrap in `group` on the parent. Copy icon appears on hover. Clicking copies to clipboard and shows a brief "Copied!" tooltip.

---

## 21. Voided Invoice Watermark

When invoice status is `VOIDED`, overlay the content area with:

```tsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-15deg]">
  <span className="text-6xl font-bold text-danger-200 select-none opacity-40 uppercase tracking-widest">
    VOIDED
  </span>
</div>
```

Parent needs `relative overflow-hidden`.

---

## 22. Dual-Pane Layout (Review Moderation)

```
┌──────────────────────────┬──────────────────────────────┐
│  Review list (40%)       │  Review detail (60%)         │
│  (scrollable)            │  (sticky, updates on select) │
└──────────────────────────┴──────────────────────────────┘
```

`flex gap-0`. Left pane: `w-2/5 border-r border-gray-200 overflow-y-auto`. Right pane: `w-3/5 p-6`.
