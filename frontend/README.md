# ITAM Enterprise — Frontend

A production-ready, fully responsive frontend for the ITAM Enterprise IT Asset Management system, built directly
against the real `Itam.WebApi` backend in this repository (controllers, DTOs, validators, roles, and enums were
read from source — nothing here is guessed).

## Tech stack

- React 18 + TypeScript (strict mode)
- Vite 6
- React Router v6 (nested layouts, lazy-loaded routes, route guards)
- TanStack Query v5 (server state, caching, retries)
- React Hook Form + Zod (`@hookform/resolvers/zod`)
- Tailwind CSS (dark mode via `class` strategy)
- Zustand (auth / theme / UI state, persisted to storage)
- Axios (typed API client with refresh-token interceptor)
- Radix UI primitives (Dialog, Dropdown Menu, Select, Tabs, Tooltip, Checkbox, Switch, Label)
- Recharts (dashboard charts)
- Lucide React (icons)
- date-fns (dates), clsx + tailwind-merge (class utilities)
- Sonner (toasts)

## Getting started

```bash
npm install
cp .env.example .env   # then point VITE_API_URL at your running Itam.WebApi instance
npm run dev             # http://localhost:5173
```

The backend's `CorsSettings:AllowedOrigins` (see `Itam.WebApi/appsettings.json`) is pre-configured for
`http://localhost:5173`, so running both with defaults works out of the box. Start the API with `dotnet run`
from `Itam.WebApi` (default: `http://localhost:5266`).

### Scripts

| Command           | Description                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`       | Start the Vite dev server                 |
| `npm run build`     | Type-check (`tsc`) then production build  |
| `npm run preview`   | Preview the production build locally      |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | `tsc --noEmit`                            |

### Environment variables

See `.env.example`:

- `VITE_API_URL` — base URL of the API, **including** `/api` (default `http://localhost:5266/api`). Falls back to
  the relative path `/api` if unset, which is convenient behind a reverse proxy (see `nginx.conf`).
- `VITE_APP_NAME` — branding text used in the sidebar/auth screen and document title.
- `VITE_DEFAULT_PAGE_SIZE` — default page size for paginated tables.
- `VITE_MAX_UPLOAD_SIZE_BYTES` — client-side attachment size guard, mirrors
  `FileStorageSettings.MaxFileSizeBytes` (5 MB) in `appsettings.json`.

## Project structure

```
src/
  assets/            static assets
  components/
    ui/              primitive design-system components (Button, Input, Dialog, Table, ...)
    layout/           AuthLayout, DashboardLayout, Sidebar, Topbar, UserMenu, ThemeToggle
    shared/           cross-feature composites (StatCard, ChartCard, AttachmentPanel, form/*)
    guards/           ProtectedRoute, GuestRoute, RoleRoute
    error/            AppErrorBoundary
  features/
    auth/             useAuth, useLogin, useLogout
    assets/           schemas + React Query hooks for assets & storage devices
    assignments/      React Query hooks for assignments
    attachments/      React Query hooks for file upload/download/delete
    tickets/           schemas + hooks for tickets
    repairs/           hooks for repair history
    users/             schemas + hooks for user management
    search/             hook for global search
    dashboard/          hooks for admin overview / employee "my dashboard"
  pages/               route-level components, one folder per feature
  services/            typed Axios calls per backend controller (1:1 with API routes)
  stores/              Zustand stores: auth-store, theme-store, ui-store
  lib/                 api-client (interceptors), query-client, query-keys, formatters, utils
  routes/              centralized route path constants
  types/               TypeScript types mirroring every backend DTO/enum exactly
```

Path alias `@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

## Authentication

The backend (`AuthController`) issues a short-lived JWT access token (15 min) plus a rotating refresh token (7
days), both returned in the JSON body of `POST /api/auth/login` — there is no cookie/session auth.

- The access token is attached as `Authorization: Bearer <token>` on every request via an Axios request
  interceptor.
- On a `401`, a response interceptor calls `POST /api/auth/refresh` **once**, using a single in-flight promise so
  concurrent 401s don't trigger multiple refresh calls. The failed request is retried with the new token.
- If refresh also fails, the auth store is cleared and an `itam:auth-logout` event redirects to `/login`.
- "Keep me signed in on this device" controls whether the auth store persists to `localStorage` (checked) or
  `sessionStorage` (unchecked) — see `src/lib/remember-me.ts`.
- Session restoration on reload is handled by Zustand's `persist` middleware; `ProtectedRoute`/`GuestRoute` show a
  splash loader until hydration completes, so there's no flash of the wrong screen.

There is **no self-service registration, forgot-password, reset-password, or change-password flow** — the backend
doesn't expose those endpoints. See `ASSUMPTIONS.md`.

## Roles & route protection

The backend has exactly two roles (`Itam.Domain.Enums.Role`): `Employee` and `ItAdmin`. Route access mirrors the
`[Authorize(Roles = ...)]` attributes on each controller:

| Area                     | Employee | ItAdmin |
| ------------------------- | :------: | :-----: |
| Dashboard (own view)      |    ✅    |   —¹    |
| Dashboard (org overview)  |    —     |   ✅    |
| My Assets                 |    ✅    |    —²   |
| My Tickets (create/cancel)|    ✅    |    ✅   |
| Assets (full catalog/CRUD)|    —     |   ✅    |
| Assignments               |    —     |   ✅    |
| All Tickets (manage/resolve)|  —     |   ✅    |
| Repairs                   |    —     |   ✅    |
| Users                     |    —     |   ✅    |
| Search                    |    ✅    |   ✅    |

¹ ItAdmin sees the org-wide overview instead. ² Not shown in the ItAdmin sidebar since admins manage assignments
from the full Assignments page, though the underlying `/assignments/my-assets` endpoint works for any
authenticated user.

Guards: `ProtectedRoute` (must be authenticated), `GuestRoute` (must be anonymous — used for `/login`), `RoleRoute`
(role allow-list, redirects to `/unauthorized`). All authenticated routes are also lazy-loaded with
`React.lazy` + `Suspense`.

## API integration

`src/services/*.ts` map 1:1 to backend controllers (`authService`, `assetService`, `assignmentService`,
`attachmentService`, `dashboardService`, `exportService`, `repairService`, `searchService`, `ticketService`,
`userService`). Every request/response type in `src/types/` mirrors the corresponding C# DTO field-for-field
(camelCase, since ASP.NET's default JSON serializer emits camelCase and enums serialize as their PascalCase
member names via `JsonStringEnumConverter`).

Responses are unwrapped from the backend's `ApiResponse<T>` envelope (`{ success, message, errors, data,
timestamp }`) by `unwrapResponse()`; failures are normalized into a consistent `{ status, message, errors }`
shape by the Axios response interceptor, so every screen shows a friendly message instead of a raw exception.

### Endpoint map

| Frontend feature      | Backend endpoint(s)                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Login / refresh / logout | `POST /api/auth/{login,refresh,logout}`                                              |
| Dashboard              | `GET /api/dashboard/{overview,my}`                                                    |
| Assets (list/detail)   | `GET /api/assets`, `GET /api/assets/{id}`                                             |
| Assets (create/update) | `POST/PUT /api/assets/{laptops,desktops,monitors,docks,keyboard-mouse-sets}[/{id}]`   |
| Asset status            | `POST /api/assets/{id}/status`                                                       |
| Asset delete             | `DELETE /api/assets/{id}`                                                            |
| Storage devices          | `GET/POST/PUT/DELETE /api/assets/storage[/{id}]`                                     |
| Assignments              | `GET/POST /api/assignments`, `POST /api/assignments/{id}/unassign`, `GET .../my-assets`, `GET .../asset/{id}/history` |
| Tickets                  | `POST /api/tickets`, `GET /api/tickets/{my-tickets,:id}`, `POST .../cancel`, `GET /api/tickets` (admin), `POST .../status`, `POST .../resolve` |
| Repairs                  | `GET /api/repairs`, `GET /api/repairs/{ticket,asset}/{id}`                           |
| Attachments               | `POST /api/{tickets,repairs,assets}/{id}/attachments`, `GET /api/attachments/{ticket,repair,asset}/{id}`, `GET /api/attachments/{id}/download`, `DELETE /api/attachments/{id}` |
| Users                     | `GET/POST/PUT /api/users[/{id}]`, `POST .../{activate,deactivate}`, `DELETE /api/users/{id}` |
| Search                    | `GET /api/search`                                                                    |
| Export                    | `GET /api/export/{assets,assignments}` (CSV, triggers a browser download)            |

## Forms & validation

Every create/update form uses React Hook Form + a Zod schema that mirrors the matching FluentValidation validator
in `Itam.Application/Validators` (max lengths, `IsInEnum`, password complexity, etc.) so client-side errors match
what the server would reject. Server-side `400`/validation errors are still surfaced via toast + a root-level
alert, since the backend is the source of truth.

Notable UX details: password visibility toggles, disabled submit + spinner while pending, dialogs that don't close
mid-submit, `Zod` coercion for numeric fields, mutually-exclusive storage-device parent selects (a device may
belong to a laptop *or* a desktop, never both — enforced client-side and by the backend), and dynamic per-asset-type
fields in a single "Add asset" dialog.

## Dashboards

- **ItAdmin** — `GET /api/dashboard/overview`: stat cards (assets, people, tickets, repairs, storage), Recharts bar/pie
  charts (assets by type/status, tickets by status/priority), most-repaired/most-ticketed asset lists, and
  role-based quick actions.
- **Employee** — `GET /api/dashboard/my`: assigned-asset count, open-ticket count, assigned assets list, and recent
  tickets, with a "Report an issue" quick action.

Both handle loading (skeletons), error (retry button), and empty states without ever showing a blank screen.

## Dark mode

Tailwind's `class` strategy. Theme preference (`light` / `dark` / `system`) is persisted to `localStorage` and
applied before first paint via an inline script in `index.html` to avoid a flash of the wrong theme. Toggle lives
in the topbar (dashboard) and auth layout header.

## Manual QA checklist

- [ ] Login with valid/invalid credentials; server error banner shows correctly
- [ ] "Keep me signed in" toggles localStorage vs sessionStorage persistence
- [ ] Logout clears the session and redirects to `/login`
- [ ] Reloading an authenticated page restores the session (no flash to `/login`)
- [ ] Visiting `/assets` as an Employee redirects to `/unauthorized`
- [ ] Visiting a protected route while logged out redirects to `/login`, then back after login
- [ ] Unknown routes render the 404 page
- [ ] Create/edit/delete for each asset type (Laptop, Desktop PC, Monitor, Dock, Keyboard & Mouse Set)
- [ ] Storage device create/edit enforces "laptop OR desktop, never both"
- [ ] Asset status change updates the badge everywhere it appears
- [ ] Assign / unassign an asset; assignment history updates
- [ ] Create a ticket (Employee), cancel it, and confirm it disappears from cancellable actions
- [ ] Resolve a ticket (ItAdmin) and confirm a repair-history entry appears
- [ ] Upload/download/delete an attachment on a ticket and on an asset
- [ ] Search returns results across assets/users/tickets and links resolve correctly per role
- [ ] Create/deactivate/activate/delete a user; self-deactivation/self-deletion is disabled
- [ ] Pagination, search, and filters on every list page; filters reset to page 1
- [ ] CSV export downloads for Assets and Assignments
- [ ] Dark mode toggle persists across reloads
- [ ] Mobile: sidebar collapses into a drawer; tables scroll horizontally; dialogs remain usable
- [ ] `npm run build` completes with no TypeScript errors

## Docker

```bash
docker build -t itam-frontend --build-arg VITE_API_URL=/api .
docker run -p 8080:80 itam-frontend
```

`nginx.conf` serves the SPA with a `try_files` fallback so client-side routing works on refresh/deep-links.

## Known limitations

See `ASSUMPTIONS.md` for the full list — most notably, there is no self-service registration or password-reset
flow because the backend doesn't provide those endpoints.
