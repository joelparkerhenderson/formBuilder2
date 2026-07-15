# Conventions — how code should look here

Read this before writing any Svelte in this repo. Facts referenced here are owned by [spec/02](../spec/02-architecture.md) (module map) and [spec/03](../spec/03-design-system.md) (design system).

## Naming taxonomy

| Prefix | Meaning | Lives in |
|---|---|---|
| `fb*` | WCP design-system primitive | `src/lib/components/fb/` |
| `fbc*` | Composer chrome | `src/lib/components/fbc/` |
| `fbcp*` | Composer property-editor input | `src/lib/components/fbcp/` |
| `fbcnt*` / `Fbcnt*` | Case Note Tracker | `src/lib/caseNoteTracker/` |
| `Generated*` | Engine B renderer | `src/lib/components/generated/` |
| `SpecDriven*` | Engine A renderer | `src/lib/components/specDriven/` |

Imports alias to PascalCase regardless of file casing: `import FbTextInput from '$lib/components/fb/fbTextInput.svelte'`.

**File casing for new files**: match the dominant pattern of the directory — lowercase prefix (`fbNewThing.svelte`) in `fb/`, `fbc/`, `fbcp/`. The existing mixed casing (`FbModalActions.svelte`, `Fbcnt*`) is GAP-07; don't add to it and don't bulk-rename in passing.

## Svelte 5 patterns

This codebase is mid-migration (GAP-03). Rules:

- **New code is runes-only**: `$props()` with inline destructuring and a typed object, `$state`, `$derived`, `$effect`. No `export let`, no `createEventDispatcher`, no `svelte/store` for new work.
- **Opportunistically migrate** any `export let` file you materially edit; don't do drive-by migrations of files you aren't otherwise touching.
- Events are **callback props** (`onChange`, `onclick`), not dispatched events.
- Reusable markup uses `{#snippet name(args)}` + `{@render name(arg)}`; layout components expose snippet props (`header`, `bottomControls` in `fbLayout`).
- **Immutable state updates** for form state: `formState = { ...formState, [key]: value }` — change detection (`compareFormStatesObj`) depends on it.
- Two-way binding on component props is used where the design calls for it (`bind:highlySensitive`, `bind:activeSection`).

## Styling

- Use the `--fb-*` CSS custom properties from `src/styles/global.css` — never hard-code palette hexes in new styles ([spec/03](../spec/03-design-system.md) has the token table; the TS mirror `src/lib/constants/fbColours.ts` exists but CSS is authoritative — GAP-08).
- Scoped `<style>` blocks per component; `rem` units; Roboto is enforced globally, Material Icons via `.material-icons`.
- Layout through `fb*` grid components (`FbGridRow` cols 1–12, `FbGridCell` span), not ad-hoc CSS grids, so the sub-768px collapse keeps working.

## Navigation and API

- Prepend `base` from `$app/paths` to every internal href; use the helpers in `src/lib/utils/fbHrefNavigation.ts` (`returnByHref`, `handleHrefNavigationClick`).
- All HTTP goes through `createApiClient` (`src/lib/api/client.ts`) or the typed functions in `src/lib/api/legacy.ts` — never raw `fetch` with hand-built URLs ([AGENTS/api-and-data.md](api-and-data.md)).
- Form routes read their parameters from the query string in `+page.ts` (`patientUuid`, `formUuid`, `formVersion`, `openInRoV`, `readOnlyBackOnly`) and keep `ssr = false`.

## Language

- UI text is British English (`en-GB` in `src/app.html`): "speciality", "organisation", "actioned".
- Patient identity: display label may be "CRN", but code/data always say `hospital_number` ([spec/07](../spec/07-rest-api-and-data-model.md), domain rule 4).
