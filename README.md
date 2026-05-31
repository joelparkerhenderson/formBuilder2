# formBuilder2
- A re-implementation of the original shadesOfPale formBuilder WCP form design and form engine using tech that may be more approachable and easily reproducible than the original.
- Aim: consistency of design and user experience across all WCP forms.
## Demo
There is a working demo at https://www.shadesOfPale.net/formBuilder2/index.html. Use the usual userName and password.
## Intended audience
Any technically literate persons (clinicians, PMs, BAs, devs) interested in experimenting or working with WCP form design.
## Suggested usage
Engage with SGS about your form(s). You'll get:
- A clinical sense check
- A design check
- An English language check
- A usability check
- A standards-compliant prototype with working "backend" and publicly accessible URL
  
...usually all within 48 hours.
## Alternative usage
- Fork the repo (that means copy all the files) to your workspace (or your LLM's workspace).
- Prepare a typewritten description of your form, including the title and a list of the sections, rows of questions, questions, radios/checkboxes, subquestions and tables. There are some examples in the file
  *design.md*. You can use any comprehensible layout or format for the specification, including:
  - Prose
  - Markdown
  - formBuilder .comp.sjs form specification files
  - JSON
  - XML
- Use your favourite LLM. Suggested prompt:
  > Read design.md, src/WaitingListCard.tsx, and the referenced files and components. Read myFormSpecification.txt. Write a .tsx file similar to src/WaitingListCard.tsx for myFormSpecification, using the supplied components. Create an app to display myForm. Display myForm. Document the form design in myFormDesign.md.
- If necessary, ask your LLM to make iterative changes to your form. This can be done using natural language.
  - Each time you make a change, it is a good idea to explicitly ask the LLM to:
    > Update myFormDesign.md with any changes as they are made.
- Engage with SGS about any problems, missing components, updates to the components, etc.
