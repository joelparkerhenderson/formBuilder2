# Legacy versions — reactOrig/ and svelteOrig/

Two frozen predecessor implementations are kept for reference (`README.md`: "for posterity and reference … no longer maintained"). Generational history is in [spec/01](../spec/01-overview.md).

## Rules

1. **Never modify anything** under `reactOrig/` or `svelteOrig/` — including "harmless" fixes, formatting, or dependency bumps.
2. **Consult them when porting or checking parity**: reactOrig was historically the most feature-complete implementation.
3. Never copy their idioms into `src/`: reactOrig is React/Tailwind; svelteOrig is Svelte-4-dialect (`export let`, no runes) in a plain Vite multi-page app. Current conventions are in [AGENTS/conventions.md](conventions.md).

## What they are

- **`reactOrig/`** — React 19 + react-router 7 + Vite 6 + Tailwind 4; SPA plus multi-page HTML entries; own Express/pg backend scripts; the original spec-driven builder (`GeneratedFormRenderer.tsx`, `Composer.tsx`), ~90 `fb*` components, ~65-file CNT, `restClient.ts` query-builder API layer.
- **`svelteOrig/`** — plain Vite 6 multi-page app (14 HTML entries, no SvelteKit), Svelte-4-style components compiled under Svelte 5; its `vite.config.ts` documents the dev proxy `/formBuilder2/api → 127.0.0.1:3210` and base-path convention.

## Parity status (audited 2026-07-15 — GAP-09 closed in [spec/10](../spec/10-gaps-and-roadmap.md))

**Confirmed at parity**: Cardiology test request (content-complete; the React file is larger only from inlined shell code), the Composer WYSIWYG (all capabilities present; `fbcFooter`/`fbcpName`/`fbcpVal` were trivial wrappers absorbed inline), the RoV shell (reimplemented inline), and the version-history menu. **Known regressions** (each has a gap entry): no user-facing stale-version conflict warning (GAP-16, partially mitigated), superseded state never computed and `fbBadgeSuperseded` orphaned (GAP-17), RoV no longer hides empty sections (GAP-19). Engine A version history was restored 2026-07-15 (GAP-18 resolved). Consult `reactOrig/src/utils/formVersion.ts` and `reactOrig/src/components/fbRoVShell.tsx` as prior art when fixing these.

## Quirk log

- `fbBadgeSupperseded` [sic] exists alongside the correctly-spelled `fbBadgeSuperseded` in reactOrig (GAP-12). Never propagate the misspelling.
- svelteOrig has no `specialities.ts`; reactOrig and current `src/` do — don't use svelteOrig as the reference for option data.
