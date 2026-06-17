import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const specMd = fs.readFileSync('spec.md', 'utf8');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractSection(markdown, startMarker, endMarker) {
  const start = markdown.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing start marker: ${startMarker}`);
  const end = markdown.indexOf(endMarker, start);
  if (end === -1) throw new Error(`Missing end marker: ${endMarker}`);
  return markdown.slice(start, end).trim();
}

function markdownBulletsToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = '';
  let inPre = false;
  for (const line of lines) {
    if (line.startsWith('#### ')) {
      html += `<h2>${escapeHtml(line.replace(/^####\s+/, ''))}</h2>\n`;
      continue;
    }
    if (line.startsWith('```')) {
      html += inPre ? '</code></pre>\n' : '<pre><code>';
      inPre = !inPre;
      continue;
    }
    if (inPre) {
      html += `${escapeHtml(line)}\n`;
      continue;
    }
    if (!line.trim()) {
      continue;
    }
    if (line.trim().startsWith('- ')) {
      const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;
      const depth = Math.floor(leadingSpaces / 4);
      const text = line.trim().replace(/^- /, '');
      html += `<div class="bullet depth-${Math.min(depth, 8)}">${inlineMarkdown(text)}</div>\n`;
      continue;
    }
    html += `<p>${inlineMarkdown(line)}</p>\n`;
  }
  return html;
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function loadTreatmentSummarySpec() {
  const source = fs.readFileSync('src/treatmentSummarySpec.ts', 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {} };
  vm.runInNewContext(transpiled, context, { filename: 'treatmentSummarySpec.js' });
  return context.exports.treatmentSummarySpec;
}

function componentLines(component, depth = 0) {
  const label = component.label ? `: ${component.label}` : '';
  const lines = [{ depth, text: `\`${component.type}\`${label}` }];
  const attrs = [
    ['id', component.id],
    ['key', component.key],
    ['required', component.required ? true : undefined],
    ['default', component.defaultValue],
    ['placeholder', component.placeholder],
    ['valueError', component.valueError],
    ['units', component.units],
    ['fullWidth', component.fullWidth ? true : undefined],
    ['colSpan', component.colSpan],
  ].filter(([, value]) => value !== undefined && value !== '');
  for (const [name, value] of attrs) {
    lines.push({ depth: depth + 1, text: `attr: ${name}: ${JSON.stringify(value)}` });
  }
  for (const option of component.options || []) {
    lines.push({ depth: depth + 1, text: `option: \`${option.value}\`: ${option.label}` });
  }
  for (const child of component.children || []) {
    lines.push(...componentLines(child, depth + 1));
  }
  return lines;
}

function treatmentSummaryHtml() {
  const spec = loadTreatmentSummarySpec();
  const lines = [
    { depth: 0, text: `attr: Composer public id: \`${spec.publicId}\`` },
    { depth: 0, text: 'attr: saved values are keyed by component id in `form_data`; coded selector companion values use `{componentId}_coded`' },
  ];
  for (const component of spec.components) {
    lines.push(...componentLines(component, 0));
  }
  return `<h2>4. Treatment summary</h2>\n${lines.map((line) => `<div class="bullet depth-${Math.min(line.depth, 8)}">${inlineMarkdown(line.text)}</div>`).join('\n')}\n`;
}

const patientFormsMarkdown = extractSection(specMd, '#### 1. Waiting list card (`wlc`)', '#### 4a. Treatment summary');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WCP eForms patient form examples</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.45; margin: 2rem; max-width: 90rem; color: #111; }
    h1, h2, h3 { color: #1b6ec2; }
    h2 { border-top: 0.2rem solid #1b6ec2; padding-top: 1rem; margin-top: 2rem; }
    code, pre { font-family: Consolas, "Roboto Mono", monospace; }
    pre { background: #f7f7f7; border: 1px solid #ccc; padding: 1rem; overflow: auto; }
    .note { border-left: 0.25rem solid #1b6ec2; padding-left: 0.8rem; }
    .bullet { margin: 0.08rem 0; padding-left: 1rem; text-indent: -0.9rem; }
    .bullet::before { content: "- "; }
    .depth-0 { margin-left: 0; }
    .depth-1 { margin-left: 1.5rem; }
    .depth-2 { margin-left: 3rem; }
    .depth-3 { margin-left: 4.5rem; }
    .depth-4 { margin-left: 6rem; }
    .depth-5 { margin-left: 7.5rem; }
    .depth-6 { margin-left: 9rem; }
    .depth-7 { margin-left: 10.5rem; }
    .depth-8 { margin-left: 12rem; }
  </style>
</head>
<body>
  <h1>WCP eForms patient form examples</h1>
  <p class="note">This document is generated from <code>spec.md</code> and <code>src/treatmentSummarySpec.ts</code>. It is a complete component-level specification for the four patient forms, expressed with the shared <code>fbXxx</code> vocabulary. Additional behaviour and field metadata are written as <code>attr:</code> bullets.</p>
  ${markdownBulletsToHtml(patientFormsMarkdown)}
  ${treatmentSummaryHtml()}
</body>
</html>
`;

for (const outputPath of [
  'docs/wcp-eForms-designSystem-examples.html',
  'docs/wcp-eForms-examples.html',
]) {
  fs.writeFileSync(outputPath, html, 'utf8');
}
