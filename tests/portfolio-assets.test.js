const root = process.cwd();
let assert;
let access;
let readFile;
let path;

async function readJson(filePath) {
  const raw = await readFile(path.join(root, filePath), 'utf8');
  return JSON.parse(raw);
}

async function assertPublicAssetExists(assetPath) {
  assert.equal(assetPath.startsWith('/'), true, `${assetPath} must be an absolute public path`);
  await access(path.join(root, 'public', assetPath.slice(1)));
}

async function main() {
  assert = (await import('node:assert/strict')).default;
  ({ access, readFile } = await import('node:fs/promises'));
  path = await import('node:path');

  const [en, fr] = await Promise.all([
    readJson('public/translations/en.json'),
    readJson('public/translations/fr.json'),
  ]);

  const requiredAssets = [
    '/images/developer-workspace-cutout.png',
    '/images/profile-shoreline.jpg',
    '/logos/github-mark-white.png',
    '/logos/linkedin-mark-white.png',
    ...en.experiences.map((experience) => experience.logo).filter((logo) => logo.startsWith('/')),
    ...fr.experiences.map((experience) => experience.logo).filter((logo) => logo.startsWith('/')),
  ];

  await Promise.all([...new Set(requiredAssets)].map(assertPublicAssetExists));

  console.log('portfolio public assets: ok');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
