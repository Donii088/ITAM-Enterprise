# Assumptions & UI decisions

This document records everywhere the frontend had to make a judgment call because the backend (as it exists in
this repository) doesn't provide a corresponding endpoint, or where behavior was inferred rather than read
directly from source.

## Backend endpoints actually used

All endpoints listed in the README's "Endpoint map" were read directly from
`Itam.WebApi/Controllers/*.cs`, and every request/response shape was read directly from
`Itam.Application/DTOs/**/*.cs` and the FluentValidation validators in `Itam.Application/Validators/**`. No
endpoint was invented.

## Missing backend capabilities (and how the UI handles them)

1. **No registration endpoint.** `AuthController` only exposes `login`, `refresh`, and `logout`. There is no
   `/api/auth/register`. The login page explicitly states that accounts are created by an IT administrator; no
   `/register` route or page was built, per the brief's instruction to only add it "if supported."

2. **No forgot-password / reset-password endpoints.** Not built. If added to the backend later, the natural
   integration points are `AuthController` (new `POST /auth/forgot-password`, `POST /auth/reset-password`) and
   two new public pages under `src/pages/public/`.

3. **No self-service profile update or change-password endpoint.** `UsersController` only exposes admin-scoped
   CRUD (`GET/POST/PUT /users`, activate/deactivate/hard-delete) — there's no "update my own profile" or "change
   my password" route, and no `ICurrentUserService`-backed self endpoint exists anywhere in `IUserService`. The
   Profile page is therefore **read-only**, sourced from the `AuthUserDto` returned at login, with an inline
   `Alert` explaining that changes must go through an IT administrator.

4. **Roles are a closed set of two.** `Itam.Domain.Enums.Role` has exactly `Employee` and `ItAdmin` — there is no
   granular permission/claims system, so `hasRole()` in `src/lib/permissions.ts` does simple role-array
   membership checks rather than a claims/permission engine. If the backend later adds granular permissions,
   `ICurrentUserService`/`ClaimConstants` would need a `permissions` claim and `hasRole` would become
   `hasPermission`.

## UI decisions made where the backend was silent on presentation

- **Asset catalog is ItAdmin-only** (`AssetsController` is `[Authorize(Roles = RoleConstants.ItAdmin)]` at the
  class level), so Employees never see a general asset browser. Employees interact with assets only through
  "My Assets" (`GET /assignments/my-assets`) and ticket creation (picking from their own assigned assets).
- **Ticket creation's asset picker** is scoped to the current user's assigned assets
  (`GET /assignments/my-assets`) rather than the full asset catalog, since `POST /tickets` is open to any
  authenticated user but a ticket only makes sense against an asset you actually hold. Both roles can create a
  ticket this way (an ItAdmin with an assigned asset could too), matching the fact that `TicketsController.Create`
  has no role restriction.
- **Attachment delete permission**: `AttachmentsController.Delete` carries no additional `[Authorize(Roles=...)]`
  beyond the controller-level `[Authorize]`, so any authenticated user can delete any attachment per the current
  backend. The UI reflects this literally (both roles see a delete action on ticket attachments) rather than
  inventing a stricter client-side rule the API wouldn't enforce anyway.
- **"Storage" is presented as a tab inside the Assets page** (not a separate top-level nav item), since
  `StorageDto`/`AssetsController`'s storage endpoints are a sub-resource of assets (`/api/assets/storage`), not an
  independent domain entity like Tickets or Users.
- **CSV export buttons** live inline on the Assets and Assignments list pages (mirroring
  `GET /api/export/{assets,assignments}`) rather than a separate "Reports" page, since the backend only exposes
  those two exports and both are natural actions on their respective list views.
- **Search result links** are role-aware: asset results only link to `/assets/:id` for ItAdmin (Employees can't
  reach that route per `RoleRoute`); ticket results always link since `/tickets/:id` is open to both roles; user
  results are shown as plain text since there's no per-user detail route.
- **Enum wire format.** `Program.cs` registers a global `JsonStringEnumConverter()` with no naming policy
  override, so enums serialize using their exact C# member names (e.g. `"InRepair"`, `"KeyboardMouseSet"`,
  `"OnReview"`) rather than camelCase. The frontend's enum constants in `src/types/enums.ts` intentionally use
  those exact PascalCase strings as values so requests/responses round-trip without any transformation layer.
- **Attachment constraints** (`.jpg`, `.jpeg`, `.png`, `.pdf`, 5 MB max) were read from
  `appsettings.json`'s `FileStorageSettings` and are enforced client-side before upload
  (`src/lib/file-validation.ts`) purely as fast-fail UX — the backend remains the source of truth and would
  reject anything that slipped through.
- **Seed data**: `Itam.Infrastructure/Seed/DbSeeder.cs` only seeds a single `ItAdmin` account
  (`SeedSettings:AdminEmail` / `AdminPassword`, defaulting to `admin@company.com` / `Admin@12345` per
  `appsettings.json`). No employee accounts are seeded — the first login must be as that admin, who then creates
  Employee accounts from the Users page.

## Fallback / resilience behavior

- Every list/detail page distinguishes loading (skeleton), error (message + retry button), and empty (icon +
  copy + primary action) states — none of them show a blank screen, matching the brief's requirement not to let a
  failed request crash the app.
- The dashboard queries (`/dashboard/overview`, `/dashboard/my`) are each a single backend call already
  aggregating multiple stats server-side, so there's one loading/error boundary per dashboard rather than a
  `Promise.allSettled` fan-out — the aggregation already happened in `DashboardService` on the backend.
- TanStack Query's default retry logic skips retries for `401/403/404/422` (these won't succeed on retry) and
  retries other failures (network errors, `5xx`) up to twice with exponential backoff before surfacing the error
  state.
