const root = process.cwd();
let assert;
let readFile;
let path;

async function readJson(filePath) {
  const raw = await readFile(path.join(root, filePath), 'utf8');
  return JSON.parse(raw);
}

function assertUrlOrAnchor(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.ok(
    value === '#' || value.startsWith('https://') || value.startsWith('mailto:'),
    `${label} must be an https URL, mailto link, or private # anchor`,
  );
}

const mojibakeMarkers = ['\u00c3', '\u00c2', '\u00e2\u20ac'];

function assertNoMojibake(value, label) {
  if (typeof value === 'string') {
    assert.equal(
      mojibakeMarkers.some((marker) => value.includes(marker)),
      false,
      `${label} contains mojibake: ${value}`,
    );
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoMojibake(item, `${label}[${index}]`));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      assertNoMojibake(item, `${label}.${key}`);
    }
  }
}

function validatePortfolioJourney(locale, data) {
  assertNoMojibake(data, locale);
  assert.equal(data.general.name, 'Xavier Pelchat', `${locale}: name is the first identity signal`);
  assert.equal(
    data.general.role,
    locale === 'fr' ? 'Développeur Full-stack' : 'Full-stack Developer',
    `${locale}: hero role stays concise`,
  );
  assert.equal(data.general.availability, 'Remote', `${locale}: availability is region-neutral`);
  assert.equal(data.cta.title, 'Remote', `${locale}: CTA availability matches the hero`);
  assert.match(
    data.general.headline,
    /production|produits|products|robustes?|systems|syst\u00e8mes/i,
    `${locale}: headline must state durable product value`,
  );
  assert.ok(data.general.socials.email.includes('@'), `${locale}: email is available`);
  assertUrlOrAnchor(data.general.socials.github, `${locale}: GitHub`);
  assertUrlOrAnchor(data.general.socials.linkedin, `${locale}: LinkedIn`);
  assert.deepEqual(data.skills.mobile, ['React Native', 'Expo'], `${locale}: mobile stack exposes React Native and Expo`);
  assert.equal(data.skills.agentic.includes('PostHog'), false, `${locale}: unrelated analytics tooling is removed`);
  assert.ok(
    data.skills.quality.some((skill) => /test/i.test(skill)),
    `${locale}: software quality stack includes automated testing`,
  );

  assert.ok(data.general.proofPoints.length >= 3, `${locale}: hero proof strip has at least three proof points`);
  assert.ok(
    data.general.operatorSignal.steps.some((step) => /verify|v\u00e9rifier/i.test(step)),
    `${locale}: operator loop includes verification`,
  );
  assert.ok(
    data.general.operatorSignal.steps.length >= 5,
    `${locale}: operator loop is complete enough to explain working style`,
  );

  const requiredNavigation = ['about', 'skills', 'experiences', 'projects', 'contact'];
  for (const key of requiredNavigation) {
    assert.ok(data.general.navigation[key], `${locale}: navigation.${key} exists`);
  }

  assert.ok(data.projects.length >= 3, `${locale}: selected work has at least three projects`);
  for (const project of data.projects.slice(0, 3)) {
    assert.ok(project.name, `${locale}: project has a name`);
    assert.ok(project.description.length > 80, `${locale}: ${project.name} has useful description`);
    assert.ok(project.outcome, `${locale}: ${project.name} states outcome`);
    assert.ok(project.proof, `${locale}: ${project.name} states proof`);
    assert.ok(project.constraint, `${locale}: ${project.name} states constraint`);
    assert.ok(project.stack.length >= 3, `${locale}: ${project.name} exposes stack`);
    assertUrlOrAnchor(project.href, `${locale}: ${project.name} href`);
  }

  assert.ok(data.experiences.length >= 3, `${locale}: experience timeline has enough entries`);
  assert.ok(
    data.experiences[0].description.includes('React') &&
      data.experiences[0].description.includes('SQL'),
    `${locale}: lead experience mentions production stack evidence`,
  );
  assert.equal(data.education[0].university, 'Université Laval', `${locale}: primary degree is from Université Laval`);
  assert.equal(
    data.education[0].subject,
    locale === 'fr' ? 'Informatique' : 'Computer Science',
    `${locale}: primary field of study is explicit`,
  );
  assert.equal(
    data.education[0].degree,
    locale === 'fr' ? 'Baccalauréat' : "Bachelor's degree",
    `${locale}: primary degree is explicit`,
  );
  assert.equal(data.education[0].startDate, '09/2021', `${locale}: degree start month is explicit`);
  assert.equal(data.education[0].endDate, '12/2024', `${locale}: degree completion month is explicit`);
}

function assertKeyParity(en, fr, path = 'root') {
  const enKeys = Object.keys(en).sort();
  const frKeys = Object.keys(fr).sort();
  assert.deepEqual(frKeys, enKeys, `translations key parity at ${path}`);

  for (const key of enKeys) {
    const enValue = en[key];
    const frValue = fr[key];
    const nextPath = `${path}.${key}`;

    if (enValue && typeof enValue === 'object' && !Array.isArray(enValue)) {
      assertKeyParity(enValue, frValue, nextPath);
    } else if (Array.isArray(enValue)) {
      assert.equal(frValue.length, enValue.length, `translations array length parity at ${nextPath}`);
    }
  }
}

async function main() {
  assert = (await import('node:assert/strict')).default;
  ({ readFile } = await import('node:fs/promises'));
  path = await import('node:path');

  const en = await readJson('public/translations/en.json');
  const fr = await readJson('public/translations/fr.json');
  const aboutSection = await readFile(path.join(root, 'components/sections/AboutSection.tsx'), 'utf8');

  validatePortfolioJourney('en', en);
  validatePortfolioJourney('fr', fr);

  assert.match(
    aboutSection,
    /primaryEducation\.(degree|subject)/,
    'the primary degree is rendered on the portfolio page',
  );

  assert.deepEqual(
    Object.keys(en.general.navigation).sort(),
    Object.keys(fr.general.navigation).sort(),
    'navigation contracts must match across locales',
  );

  assertKeyParity(en, fr);

  assert.throws(
    () => assertUrlOrAnchor('javascript:alert(1)', 'unsafe link'),
    /must be an https URL/,
    'negative link validation catches unsafe URLs',
  );

  console.log('portfolio content journey: ok');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
