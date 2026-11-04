# Issue #9: Order-item media recovery review

## Scope and baseline

Issue #9 requests a review of the former uncommitted order-item media work, focused commits only after review, and protection of unrelated WIP. The relevant work is already on the shared `dev` history in `095e745` (`feat(products): add product and order media support`), whose parent is `8288674`.

The review was performed against that committed diff. It must not rewrite or split shared history. Any follow-up commits are restricted to newly identified test evidence or documentation; no pre-existing worktree change is staged.

## Reviewed logical slices

| Slice | Reviewed behavior | Contract/source of truth | Test evidence |
| --- | --- | --- | --- |
| Order-item media display | `orderService` normalizes the documented `productImageUrl`; `getOrderItemImage` falls back to direct image fields, variant media, then product media. `OrderItemsTable` renders an image or package fallback. | Admin contract's `OrderItemResponse.productImageUrl`; backend order service selects a preferred image. | `orderService.test.ts` covers direct URL, variant-primary preference, product fallback, and video exclusion. |
| Product and variant media display | Product detail media is grouped into product and variant views; product preview prefers product gallery media. | Product detail `MediaResponse` read contract. | `productEditPage.test.tsx` covers gallery/variant rendering and the read-only notice/actions. |
| Media write controls | Add/edit/remove/primary/reorder controls remain intentionally unavailable. The UI states that a ProductMedia write API is required. | There is no admin ProductMedia write endpoint in the current backend contract. | Read-only state is asserted from the rendered product edit page. |

## Decisions and follow-up boundaries

- Do not enable or implement media mutations in this Issue. That decision belongs to backend Issue #24, which must choose the URL-only or upload MVP and publish the matching contract.
- Keep the admin editor intentionally read-only until Issue #24 supplies a supported API. Admin Issue #10 will then either complete the editor against that contract or remove it deliberately.
- Do not revise `095e745` or stage unrelated `AGENTS.md` work. It is already reachable from `dev`, so retroactive splitting would rewrite shared history and violates the workspace rules.
- Backend Issue #26 is currently recorded as blocked by Issue #9, but no carrier/payment roadmap change is required by this media review.

## Verification

- Targeted order and product media tests: passed (5 tests across 2 files).
- Repository lint: passed.
- Repository typecheck: passed.
- Full Vitest suite: passed with the local backend running (31 test files, 96 tests).
- Production build: blocked by TypeScript errors in unrelated audit-log, carriers, customers, inventory, invoices, list filters, users, vouchers, and shared table-filter code. No build error references a file changed for this Issue.
