const root = process.cwd();
let assert;
let readFile;
let path;

async function main() {
  assert = (await import('node:assert/strict')).default;
  ({ readFile } = await import('node:fs/promises'));
  path = await import('node:path');

  const raw = await readFile(path.join(root, 'package.json'), 'utf8');
  const packageJson = JSON.parse(raw);
  const scripts = packageJson.scripts;

  assert.ok(scripts.test.includes('tests/portfolio-content.test.js'), 'test runs content contract');
  assert.ok(scripts.test.includes('npm run lint'), 'test runs lint');
  assert.ok(scripts.test.includes('npm run build'), 'test runs production build');
  assert.ok(scripts.test.includes('tests/portfolio-runtime-proof.mjs'), 'test runs runtime proof');
  assert.equal(
    scripts['proof:production'],
    'node tests/portfolio-runtime-proof.mjs --url https://xpelch.vercel.app --label production',
    'production proof targets the canonical public URL',
  );
  assert.ok(scripts['proof:current'].includes('proof:production'), 'current proof includes production proof');

  console.log('portfolio proof scripts: ok');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
