# formBuilder2
- A re-implementation of the original shadesOfPale formBuilder WCP form design and forms engine using tech that may be more approachable and more easily reproducible than the original.
- Aim: consistency of design and user experience across all WCP forms.
- formBuilder2 is now Svelte 5 and SvelteKit. The source for the legacy React and Svelte 4 versions in included in reactOrig/ and svelteOrig/ for posterity and reference, but is no longer maintained.
## Demo
There is a working demo at https://www.shadesOfPale.net/formBuilder2/index.html. Use the usual userName and password.
## Roll your own forms
Try the WYSIWYG app at https://www.shadesOfPale.net/formBuilder2/composer.html.
## Case note tracker
This repo also contains the source for case note tracker in src/lib/caseNoteTracker. Working demo at [www.shadesOfPale.net/formBuilder2/caseNoteTracker.html](https://www.shadesOfPale.net/formBuilder2/caseNoteTracker.html)
## Intended audience
Any persons (clinicians, PMs, BAs, devs) interested in experimenting or working with WCP form design.
## Specifications and documentation
- [index.md](index.md) — the full documentation map.
- [AGENTS.md](AGENTS.md) — entry point for AI agents and contributors.
- [spec/](spec/00-conventions.md) — living specifications for spec-driven development (kept in step with the code).
- docs/ — the canonical HTML specifications (design system, CNT) and historical REST API notes.
## Suggested usage
Engage with SGS about your form(s). You'll get:
- A clinical sense check
- A design check
- An English language check
- A usability check
- A standards-compliant prototype with working "backend" and publicly accessible URL
  
...usually all within 48 hours.
## Alternative usage
- Fork the repo (that means copy all the files) to your workspace (or your AI's workspace).
- Use formBuilder2 composer _or_ prepare a typewritten description of your form, including the title and a list of the sections, rows of questions, questions, radios/checkboxes, subquestions and tables. There are some examples in the file *docs/wcp-eForms-designSystem-examples.html*.
You can use any reasonable layout or format for the specification, including:
  - Prose
  - Markdown
  - formBuilder legacy .comp.sjs form specification files
  - JSON
  - XML
- Use your favourite AI. Suggested prompt:
  > Read docs/wcp-eForms-designSystem-specification.html, src/routes/waiting-list-card/+page.svelte, and the referenced files and components. Read myFormSpecification.txt. Write a .svelte file similar to src/routes/waiting-list-card/+page.svelte for myFormSpecification, using the supplied components. Create an app to display myForm. Display myForm. Document the form design in myFormDesign.md.
- If necessary, ask your AI to make iterative changes to your form. This can be done using natural language.
  - Each time you make a change, it is a good idea to explicitly ask the AI to:
    > Update myFormDesign.md with any changes as they are made.
- Engage with SGS about any problems, missing components or functionality, updates, etc.