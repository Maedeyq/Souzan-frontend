# Agent instructions: Souzan frontend

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. Talks to the Souzan Django REST API (JWT).

## Always
- Read `DESIGN.md` before touching UI and follow it exactly. Use tokens and components; no hardcoded colors.
- New pages live in `src/app/(site)/`. Do not extend `src/app/(legacy)/`; migrate pages out of it instead.
- The UI is Persian and RTL: use logical Tailwind utilities (`ms-`, `pe-`, `text-start`), never left/right ones.
- Run `npm run lint` and `npm run build` before finishing; both must pass.

## Conventions
- Components: `PascalCase.tsx`, named exports. Hooks, helpers and services: `camelCase.ts`; hooks start with `use`.
- Import with `@/` across directories; relative imports only inside the same directory; `import type` for types.
- Route-only code stays beside its route; reusable domain code goes in `src/features/<feature>`.
- All backend calls go through `src/services/api/client.ts` and its endpoint modules. Never call `fetch` for the backend from UI code.
- `NEXT_PUBLIC_` variables are public. Never put secrets in them. Never commit `.env.local`.

## Do not
- Do not add dependencies or UI libraries without asking.
- Do not invent API fields; check the backend OpenAPI schema (`/api/schema/` on the Django server).
- Do not change tokens or shared components as a side effect of a feature task.
