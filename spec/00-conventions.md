<!-- living-spec -->
Status: living
Last-updated: 2026-07-15
Source-of-truth: this-file
Verified-against: 637f03a
Owns: the rules that govern every document in spec/ — headers, numbering, linking, and update triggers.

# spec/00 — Specification conventions

The `spec/` directory is the **living, comprehensive specification** of formBuilder2, written for spec-driven development: specifications are updated first (or at latest, together with the code), and an AI agent or human contributor should be able to regenerate or extend any part of the system correctly from these documents plus the canonical inputs they cite.

## The three documentation tiers

| Tier | Location | Answers | Style |
|---|---|---|---|
| Specifications | `spec/` | *What is true* — normative, comprehensive | Precise, complete, tables |
| Agent guides | `AGENTS.md`, `AGENTS/` | *How to act* — operational guidance | Short, imperative, links into spec/ |
| Navigation | `index.md` | *Where everything is* | Pure map, no content |

**Single-source rule.** Every fact is owned by exactly one file (declared in its `Owns:` header line). All other documents link to the owner; they never restate the fact. Notable ownerships:

- Route ↔ engine matrix → [spec/02-architecture.md](02-architecture.md)
- Field-type references → [spec/04-engine-a-spec-driven.md](04-engine-a-spec-driven.md) and [spec/05-engine-b-designer.md](05-engine-b-designer.md)
- API endpoints and domain rules → [spec/07-rest-api-and-data-model.md](07-rest-api-and-data-model.md)
- Audit items → [spec/10-gaps-and-roadmap.md](10-gaps-and-roadmap.md); other files cite them only as `GAP-NN`
- Glossary → [spec/01-overview.md](01-overview.md)

## Living-document header

Every file in `spec/` begins with this header:

```markdown
<!-- living-spec -->
Status: living | draft | stable
Last-updated: YYYY-MM-DD
Source-of-truth: code | this-file | docs/<file>
Verified-against: <git short SHA>
Owns: <one-line scope statement>
```

Field semantics:

- **Status** — `living`: actively tracks a moving target, expect frequent updates. `draft`: incomplete or describing planned behaviour. `stable`: settled; changes are rare and deliberate.
- **Source-of-truth** — the direction of authority:
  - `code`: the spec *describes* the implementation; when code and spec disagree, code wins and the spec must be regenerated.
  - `this-file`: the spec is *normative*; when code and spec disagree, the code must be brought into conformance (or the spec deliberately amended). This is the destination state of spec-driven development — files start as `code` and flip to `this-file` as they mature.
  - `docs/<file>`: the spec distils a canonical document (e.g. `docs/wcp-eForms-designSystem-specification.html`); on conflict, the canonical document wins.
- **Verified-against** — the git short SHA at which the file's claims were last checked against the repo.
- **Owns** — the scope this file is the single source for.

## Numbering and naming

- Spec files are `NN-kebab-name.md`, zero-padded two digits. `00` is reserved for this file.
- **Append, never renumber.** New specs take the next free number; existing numbers are permanent (links depend on them).
- **Split policy.** When a section of a spec grows past roughly 300 lines, graduate it into its own numbered file and leave a link behind.
- `AGENTS/` files are unnumbered kebab-case (they are topical, not sequential).

## Cross-linking rules

1. **Link direction**: `AGENTS/*` → `spec/*`, never the reverse (single exception: this file's pointer to [AGENTS/workflows.md](../AGENTS/workflows.md) for the update recipes). `spec/*` files link among themselves freely. `index.md` links to everything; nothing links to `index.md` except `README.md` and `AGENTS.md`.
2. **Paths**: cite repo-relative backticked paths, e.g. `src/lib/data/specDrivenFormTypes.ts`. When citing behaviour, name the symbol (`areAllSectionsComplete`), never a line number — line numbers rot.
3. **Canonical-input pattern**: a spec distilling a `docs/*.html` file carries `Source-of-truth: docs/<file>` and the conflict rule "the HTML wins".
4. **Supersession pattern**: a spec consolidating a `docs/*.md` file states so in a supersession notice; the superseded file is retained unmodified as a historical input.
5. **Terminology**: use the glossary terms from [spec/01-overview.md](01-overview.md) unglossed; in particular, always say **Engine A** (`SpecDrivenFormSpec`) and **Engine B** (`DesignerFormSpec`).

## Update triggers

When you change code in the left column, update the spec(s) in the right column **in the same change**, and bump `Last-updated` and `Verified-against`:

| If you change… | Update… |
|---|---|
| `src/lib/data/specDrivenFormTypes.ts`, `src/lib/components/specDriven/*` | spec/04 |
| `src/lib/data/treatmentSummarySpec.ts` (types), `src/lib/utils/generatedForm.ts`, `src/lib/components/generated/*` | spec/05 |
| Any form route under `src/routes/` (add/remove/change form behaviour) | spec/06, and the route matrix in spec/02 |
| `src/lib/api/client.ts`, `src/lib/api/legacy.ts`, or the API contract | spec/07 |
| `setup-db.ts`, `seed-patients.ts`, `scripts/seed-*-real-db.ts` | spec/07 |
| `src/lib/components/fb/*` (add/remove/rename a primitive), `src/styles/global.css` tokens | spec/03 |
| `src/lib/caseNoteTracker/*` | spec/08 |
| Anything that resolves or creates a known gap | spec/10 |
| Repo layout, build tooling, deployment | spec/02 |

Operational recipes for keeping these documents alive are in [AGENTS/workflows.md](../AGENTS/workflows.md).

## Canonical inputs (never modify)

- `docs/wcp-eForms-designSystem-specification.html` — the WCP eForms design system.
- `docs/wcp-eForms-designSystem-examples.html` — worked form and page examples.
- `docs/cnt-specification.html` — the Case Note Tracker specification and user guide.
- `reactOrig/`, `svelteOrig/` — frozen legacy implementations, reference only.
