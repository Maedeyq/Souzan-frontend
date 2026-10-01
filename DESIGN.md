# Souzan Design System

Read this before writing or changing any UI. Following it makes every new page look like Souzan automatically.

## Product context
Souzan is a Persian (fa), right-to-left (RTL) marketplace connecting customers with tailors.
Flow: customer writes a project request -> tailors send proposals -> customer accepts -> order -> reviews.
Audience includes elderly, non-technical users. Goal: calm, premium, minimal, and obvious to use.
Look: Upwork-like page structure, macOS-app feel (frosted header, window frame, soft shadows),
navy / red / white / yellow palette in a Polo-like luxury-minimal spirit.

## Where things live
- Tokens (colors, radii, shadows, font, container width): `src/app/(site)/globals.css` inside `@theme`.
- Reusable UI: `src/components/ui/`. Page structure: `src/components/layout/`. Feature code: `src/features/<feature>/`.
- Never hardcode hex colors, pixel radii or shadows in components. Use the token classes below.
- Missing a token or component? Add it there first, then use it. Do not style one-off.

## Two route groups (migration in progress)
- `src/app/(site)/` is the NEW design system (Tailwind v4 + tokens). All new work goes here.
- `src/app/(legacy)/` is the OLD green theme (plain CSS in `legacy.css`, `dashboard.css`, `profile.css` and `src/components/legacy/`).
  It has its own root layout, so legacy CSS can never leak into new pages (moving between groups is a full page load).
- Do not add features to legacy pages and do not import legacy CSS or `components/legacy` from new code.
- To migrate a legacy page: move its folder into `(site)`, rebuild the markup with `PageShell`, `Section` and the `ui` components,
  keep its logic and API calls, delete its CSS. When `(legacy)` is empty, delete it, `legacy.css` and `components/legacy`.
- Still legacy: `/dashboard`, `/orders`, `/notifications`, `/portfolio`, `/profile`, `/ui`.

## Tokens (Tailwind classes)
| Purpose | Classes |
| --- | --- |
| Brand, headings, primary button | `bg-brand` `text-brand` (navy) |
| The single main action of a screen, errors | `bg-accent` `text-accent` (red) |
| Highlight, selected row, on dark backgrounds | `bg-highlight` `bg-highlight-soft` (yellow) |
| Page bands and soft backgrounds | `bg-canvas`, `bg-surface` (white) |
| Body text, secondary text, borders | `text-ink`, `text-muted`, `border-line` |
| Radius | `rounded-control` (buttons, inputs), `rounded-card`, `rounded-window` |
| Shadow | `shadow-card`, `shadow-window` |
| Page width | `max-w-page` (use `Container`/`Section`) |

Yellow is never a text color on white (fails contrast); use it as a background with navy text.
Red is for the one main action and for errors. Light theme only.

## Typography
Vazirmatn, self-hosted from `public/fonts` (no external font requests). Base 18px, line-height 1.9, headings weight 800.
Nothing readable below 16px. Sentence case. Keep lines under about 35em.

## Layout
- Every page: `<PageShell>` then one or more `<Section>` (`tone="canvas"` alternates bands). Titles: `<SectionTitle>`.
- Card grids: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`. Spacing comes from `Section`; do not add extra page padding.
- The header is frosted and sticky. Do not build a second header.

## Components (`src/components/ui`)
- `Button`: variants `primary` (navy), `accent` (red), `highlight` (yellow), `outline`; sizes `md` (52px) and `sm` (44px). Pass `href` to render a link.
- `Card`, `Badge` (tags/status), `Avatar` (initial letter; always show the name next to it), `Logo`.
- `TextField`: labeled input with hint and error. Never placeholder-only fields.
- `Window`: macOS-style window frame. At most one per page, for product previews.

## RTL rules
- Logical utilities only: `ms-` `me-` `ps-` `pe-` `start-` `end-` `text-start` `text-end`.
- Never `ml-` `mr-` `pl-` `pr-` `left-` `right-` `text-left` `text-right`.
- Mirror directional icons. Latin-only inputs (username, email, password) use `dir="ltr"` with `text-start`.

## Usability rules (elderly-friendly)
- One primary action per screen; secondary actions use `outline`.
- Touch targets at least 44px high; main buttons 52px.
- No icon-only buttons: every icon has a visible text label.
- Long flows go step by step: one question per step with a progress indicator.
- Every input has a visible label. Errors say what is wrong and how to fix it, next to the field.
- Body text meets WCAG AA contrast. The global focus ring (`:focus-visible`) must never be removed.
- Prefer real pages over modals for important flows (login, register).

## Copy rules (Persian UI text)
- Friendly, plain, informal ("می‌خوای"), no jargon.
- Fixed vocabulary: project request = «درخواست دوخت»، proposal = «پیشنهاد»، order = «سفارش»، tailor = «خیاط»، review = «نظر».
- Buttons say exactly what happens: «ثبت درخواست»، «انتخاب این خیاط». Not «ارسال» or «تأیید» alone.
- Persian digits and the unit «تومان» (confirm the currency with the backend).
- Empty states say what to do next. Errors never blame the user.
- Never show invented data as real. Sample content must be labeled «نمونه».

## Adding a new page or feature
1. Create it under `src/app/(site)/`; wrap in `PageShell`; build from `Section` and `ui` components.
2. Need something new? Add or extend a component in `ui/` using only tokens.
3. Backend calls go through `src/services/api`. Never call `fetch` directly from UI code.
4. Check RTL utilities, 44px targets, visible labels, copy vocabulary.
5. Run `npm run lint` and `npm run build`.

## Not in the design
No measuring-tape motif. No dark mode. No decorative gradients beyond the hero wash.

## Open items
- Mobile navigation menu (main nav is hidden below `md`; login and register stay visible).
- Real tailor photos and portfolio images (avatars are initials).
- Loading, empty and error states for lists.
- Migrate the legacy pages (see above).
