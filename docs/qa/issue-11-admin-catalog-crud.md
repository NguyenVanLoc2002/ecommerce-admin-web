# Issue #11: Admin catalog CRUD verification

## Purpose and scope

This runbook verifies the existing Admin Web integration against the development backend for the three catalog resources exposed by Issue #11:

- brands;
- categories;
- products, including a brand and category reference.

It excludes product variants, product media, product attributes, payments, and customer checkout flows.

## Preconditions

- Run only against an approved development or local backend, never production.
- Configure `VITE_API_BASE_URL` with that backend's `/api/v1` base URL.
- Use a dedicated `ADMIN` or `SUPER_ADMIN` test account. Do not record its credentials or bearer token.
- Use a unique prefix, for example `issue-11-YYYYMMDD-HHmm`, for all test names and slugs.
- Start with the Admin Web and backend healthy, then sign in through the Admin Web.

## Verification sequence

1. Create a Brand from `/brands`. Confirm the success feedback and that it appears in the active list.
2. Create a root Category from `/categories`. Confirm the success feedback and that it appears in the active list.
3. Create a draft Product from `/products/new`, selecting the created Brand and Category. Confirm navigation to the product detail route and that the selected references render correctly.
4. Update the name or description of each resource through the Admin Web. Refresh the corresponding list or detail screen and confirm the persisted values.
5. Delete the Product, then the Category, then the Brand through their confirmation dialogs. Confirm they disappear from active lists.
6. Switch each list to the deleted filter and confirm its test record is present. This proves the expected soft-delete behavior.

## Evidence record

Complete this table only after executing the sequence. Values must be sanitized: record no credentials, access tokens, cookies, or unrelated customer data.

| Resource | Created ID | Create result | Update result | Active-list result | Deleted-list result | Screenshot/recording |
| --- | --- | --- | --- | --- | --- | --- |
| Brand | Sanitized | Success feedback | Not run | Visible to Super Admin and Admin | Soft-deleted during cleanup | Headless Chrome UI, 2026-11-08 |
| Category | Sanitized | Success feedback | Not run | Visible to Super Admin and Admin | Soft-deleted during cleanup | Headless Chrome UI, 2026-11-08 |
| Product | Sanitized | Detail-route navigation and success feedback | Not run | Visible to Super Admin and Admin | Soft-deleted during cleanup | Headless Chrome UI, 2026-11-08 |

## Result notes

- Super Admin completed the creation flow for Brand, Category, and Product.
- The first Admin verification returned `403` because its issued JWT contained only the `CUSTOMER` role. This was corrected as development data; no application authorization code was changed.
- After the role correction, the Admin JWT contained `ADMIN`; direct category access returned `200`, and all three catalog list screens rendered without an error state.

## Cleanup

The verification flow soft-deletes every test record. If it is interrupted, delete the test Product before its Category and Brand, then verify all three records appear only in their respective deleted filters.
