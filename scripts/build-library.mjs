import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const buildStamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDirName = `formBuilder2-${buildStamp}`;
const outDir = join(root, 'compiled', outDirName);
const assetsDir = join(outDir, 'assets');

const vite = spawnSync(
  process.execPath,
  [join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--config', 'vite.library.config.ts'],
  { cwd: root, stdio: 'inherit', env: { ...process.env, FB_LIBRARY_OUT_DIR: `compiled/${outDirName}` } },
);

if (vite.status !== 0) {
  process.exit(vite.status ?? 1);
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const fullPath = join(dir, entry.name);
  return entry.isDirectory() ? walk(fullPath) : [fullPath];
});

const assetFiles = walk(assetsDir);
const hashFor = (filePath) => createHash('sha256').update(readFileSync(filePath)).digest('hex').slice(0, 12);
const webPath = (filePath) => relative(outDir, filePath).split(sep).join('/');
const cacheBusted = (filePath) => `${webPath(filePath)}?v=${hashFor(filePath)}`;
const cssLinks = assetFiles
  .filter((filePath) => filePath.endsWith('.css'))
  .sort()
  .map((filePath) => `    <link rel="stylesheet" href="${cacheBusted(filePath)}" />`)
  .join('\n');

const pageScript = (entryName) => {
  const candidates = assetFiles
    .filter((filePath) => filePath.startsWith(assetsDir) && filePath.endsWith('.js'))
    .filter((filePath) => relative(assetsDir, filePath).split(sep).length === 1)
    .filter((filePath) => relative(assetsDir, filePath).startsWith(`${entryName}-`))
    .sort();
  if (candidates.length !== 1) {
    throw new Error(`Expected one generated ${entryName} entry script, found ${candidates.length}`);
  }
  return cacheBusted(candidates[0]);
};

const pageTitle = (entryName) => {
  if (entryName === 'components') return 'Component library';
  if (entryName === 'caseNoteTracker') return 'Case note tracker';
  return 'formBuilder2';
};

const fontLinks = `    <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,500&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />`;

const htmlFor = (entryName) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle(entryName)}</title>
${fontLinks}
${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${pageScript(entryName)}"></script>
  </body>
</html>
`;

writeFileSync(join(outDir, 'index.html'), htmlFor('index'));
writeFileSync(join(outDir, 'caseNoteTracker.html'), htmlFor('caseNoteTracker'));
writeFileSync(join(outDir, 'components.html'), htmlFor('components'));
writeFileSync(join(outDir, 'composer.html'), htmlFor('composer'));
writeFileSync(join(outDir, 'userForm.html'), htmlFor('userForm'));
writeFileSync(join(root, 'compiled', 'latest-library-build.txt'), `${outDir}\n`);
