# Souzan Frontend

Frontend for the Souzan marketplace platform (customers ↔ tailors), built with Next.js.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Connects to the [Souzan-Backend](https://github.com/Maedeyq/Souzan-Backend) Django REST API

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A running Souzan backend for API-backed pages

## Setup

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

Make sure the backend is running locally at the URL set in `NEXT_PUBLIC_API_BASE_URL`
(default: `http://localhost:8000/api`). Variables prefixed with `NEXT_PUBLIC_` are
included in browser bundles and must never contain secrets.

The development server is available at `http://localhost:3000` by default.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint across the project |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |

## Project structure

```
src/
  app/                 Routes, layouts, and route-specific styles
  components/
    layout/            Shared page-shell and navigation components
    ui/                Reusable UI primitives
  features/            Feature modules and feature-local components
  hooks/               Reusable React hooks
  lib/                 Framework-agnostic helpers and configuration
  services/
    api/               HTTP client and endpoint-specific API modules
  constants/           Shared immutable values
  types/               Shared TypeScript types
```

Empty foundation directories contain `.gitkeep` until their first implementation is
added. Route-only code stays beside its route; reusable domain code belongs in a
feature module.

## Environment variables

`.env.local.example` is the committed template. Copy it to `.env.local`, which is
ignored by Git, and replace only local values. Never commit credentials or tokens.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | No | Django API base URL; defaults to `http://localhost:8000/api` |

Restart the development server after changing environment variables.

## Naming and import conventions

- Use `PascalCase.tsx` for React components and exported component names.
- Use `camelCase.ts` for hooks, helpers, and service modules. Hooks start with `use`.
- Use lowercase route folder names as required by the App Router.
- Prefer named exports for reusable modules; route files keep Next.js default exports.
- Use `@/` for imports across directories (for example, `@/services/api/client`).
- Use relative imports only within the same directory. Order imports as framework or
  package imports, then `@/` imports, then relative imports, with type-only imports
  written using `import type`.

The `@/` alias maps to `src/` in `tsconfig.json`.

## API client

`src/services/api/client.ts` owns base URL handling, JSON requests, authentication
headers, token refresh, and normalized API errors. Endpoint modules such as
`src/services/api/auth.ts` build on that client. UI code should not call `fetch`
directly when communicating with the Souzan backend.

Before opening a pull request, run:

```bash
npm run lint
npm run build
```
