# Legacy versions — reactOrig/ and svelteOrig/

Two frozen predecessor implementations are kept for reference (`README.md`: "for posterity and reference … no longer maintained"). Generational history is in [spec/01](../spec/01-overview.md).

## Rules

1. **Never modify anything** under `reactOrig/` or `svelteOrig/` — including "harmless" fixes, formatting, or dependency bumps.
2. **Consult them when porting or checking parity**: reactOrig was historically the most feature-complete implementation.
3. Never copy their idioms into `src/`: reactOrig is React/Tailwind; svelteOrig is Svelte-4-dialect (`export let`, no runes) in a plain Vite multi-page app. Current conventions are in [AGENTS/conventions.md](conventions.md).

## What they are

- **`reactOrig/`** — React 19 + react-router 7 + Vite 6 + Tailwind 4; SPA plus multi-page HTML entries; own Express/pg backend scripts; the original spec-driven builder (`GeneratedFormRenderer.tsx`, `Composer.tsx`), ~90 `fb*` components, ~65-file CNT, `restClient.ts` query-builder API layer.
- **`svelteOrig/`** — plain Vite 6 multi-page app (14 HTML entries, no SvelteKit), Svelte-4-style components compiled under Svelte 5; its `vite.config.ts` documents the dev proxy `/formBuilder2/api → 127.0.0.1:3210` and base-path convention.

## Known parity questions (owned by GAP-09 in [spec/10](../spec/10-gaps-and-roadmap.md))

Features visible in reactOrig with unverified equivalents in `src/`: `formHistory.ts`/`formVersion.ts` utilities, `fbRoVShell` + dedicated `*RoV` views, `fbViewOldVersion`; and `reactOrig/src/etr/CardiologyTestRequest.tsx` is substantially larger than the current port. Verify before assuming the current app is feature-complete.

## Quirk log

- `fbBadgeSupperseded` [sic] exists alongside the correctly-spelled `fbBadgeSuperseded` in reactOrig (GAP-12). Never propagate the misspelling.
- svelteOrig has no `specialities.ts`; reactOrig and current `src/` do — don't use svelteOrig as the reference for option data.
