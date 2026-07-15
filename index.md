# formBuilder2 — documentation index

The map of every document in this repository. Content lives in the documents; this file only points.

**Start here by audience**: human newcomer → [README.md](README.md) · AI agent or contributor → [AGENTS.md](AGENTS.md) · specification question → `spec/` (rules in [spec/00](spec/00-conventions.md)).

## Document inventory

| Document | Purpose | Status |
|---|---|---|
| [README.md](README.md) | Human intro: what formBuilder2 is, demos, suggested usage | Living |
| [AGENTS.md](AGENTS.md) | Agent entry point: repo map, warnings, conventions digest | Living |
| [AGENTS/architecture.md](AGENTS/architecture.md) | How the app hangs together, operationally | Living |
| [AGENTS/conventions.md](AGENTS/conventions.md) | Code style: naming, runes, styling, navigation | Living |
| [AGENTS/form-engines.md](AGENTS/form-engines.md) | Engine A vs Engine B vs hand-coded decision guide | Living |
| [AGENTS/api-and-data.md](AGENTS/api-and-data.md) | Persistence digest: bindings, inviolable rules, seeds | Living |
| [AGENTS/cnt.md](AGENTS/cnt.md) | Case Note Tracker working notes | Living |
| [AGENTS/legacy.md](AGENTS/legacy.md) | reactOrig/svelteOrig rules and quirk log | Living |
| [AGENTS/workflows.md](AGENTS/workflows.md) | Task recipes: new form, modify form, new component, doc upkeep | Living |
| [spec/00-conventions.md](spec/00-conventions.md) | The spec constitution: headers, numbering, linking, update triggers | Normative |
| [spec/01-overview.md](spec/01-overview.md) | Product statement, sub-products, history, glossary | Living |
| [spec/02-architecture.md](spec/02-architecture.md) | System context, module map, route ↔ engine matrix, deployment | Living |
| [spec/03-design-system.md](spec/03-design-system.md) | Tokens, fb* component inventory, cross-cutting rules | Distils canonical HTML |
| [spec/04-engine-a-spec-driven.md](spec/04-engine-a-spec-driven.md) | Engine A full reference + authoring checklist | Living |
| [spec/05-engine-b-designer.md](spec/05-engine-b-designer.md) | Engine B full reference, Composer pipeline, A↔B mapping | Living |
| [spec/06-forms-catalogue.md](spec/06-forms-catalogue.md) | Per-form living specifications | Living |
| [spec/07-rest-api-and-data-model.md](spec/07-rest-api-and-data-model.md) | Normative API contract, domain rules, PostgreSQL schema, CNT future API | Living; supersedes docs/*.md |
| [spec/08-case-note-tracker.md](spec/08-case-note-tracker.md) | CNT distilled: pages, data model, backend status | Distils canonical HTML |
| [spec/09-non-functional.md](spec/09-non-functional.md) | A11y, security, data integrity, quality infra — as testable requirements | Living |
| [spec/10-gaps-and-roadmap.md](spec/10-gaps-and-roadmap.md) | Audit register (GAP-NN) and ordered roadmap | Living |
| `docs/wcp-eForms-designSystem-specification.html` | The WCP eForms design system | **Canonical input — do not modify** |
| `docs/wcp-eForms-designSystem-examples.html` | Worked form and page examples | **Canonical input — do not modify** |
| `docs/cnt-specification.html` | CNT specification and user guide | **Canonical input — do not modify** |
| `docs/restAPI.md` | Original REST API doc | Historical input — superseded by [spec/07](spec/07-rest-api-and-data-model.md), retained verbatim |
| `docs/cnt.restAPI.md` | Original CNT REST contract | Historical input — superseded by [spec/07](spec/07-rest-api-and-data-model.md), retained verbatim |
| `reactOrig/`, `svelteOrig/` | Legacy implementations | **Frozen — do not modify** |

## Reading paths

**"I want to build a form"** → [AGENTS/workflows.md](AGENTS/workflows.md) → [AGENTS/form-engines.md](AGENTS/form-engines.md) → [spec/04](spec/04-engine-a-spec-driven.md) (or [spec/05](spec/05-engine-b-designer.md)) → [spec/03](spec/03-design-system.md) → register it in [spec/06](spec/06-forms-catalogue.md).

**"I want to understand the API and data"** → [AGENTS/api-and-data.md](AGENTS/api-and-data.md) → [spec/07](spec/07-rest-api-and-data-model.md) → `docs/restAPI.md` for narrative history.

**"I want to work on CNT"** → [AGENTS/cnt.md](AGENTS/cnt.md) → [spec/08](spec/08-case-note-tracker.md) → `docs/cnt-specification.html`.

**"What's broken or unfinished?"** → [spec/10-gaps-and-roadmap.md](spec/10-gaps-and-roadmap.md).
