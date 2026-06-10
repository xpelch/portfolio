import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import os from 'node:os';
import { createRequire } from 'node:module';

const root = process.cwd();
const require = createRequire(import.meta.url);
const outputDir = path.join(root, 'logs', 'visual');
const nextCliPath = require.resolve('next/dist/bin/next');
const pagePath = path.join(root, 'app', 'page.tsx');
const chromeCandidates = [
  process.env.PORTFOLIO_CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
].filter(Boolean);
function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const cliUrl = readArg('--url');
const proofLabel = readArg('--label') ?? (cliUrl || process.env.PORTFOLIO_PROOF_URL ? 'production' : 'runtime');
const providedUrl = cliUrl ?? process.env.PORTFOLIO_PROOF_URL;
const port = Number(process.env.PORTFOLIO_PROOF_PORT ?? 3107);
const baseUrl = providedUrl ?? `http://127.0.0.1:${port}`;
const proofJsonPath = path.join(outputDir, `portfolio-${proofLabel}-proof.json`);
const proofMdPath = path.join(outputDir, `portfolio-${proofLabel}-proof.md`);
const mojibakeMarkers = ['\u00c3', '\u00c2', '\u00e2\u20ac'];

function hasMojibake(value) {
  return typeof value === 'string' && mojibakeMarkers.some((marker) => value.includes(marker));
}

function assertNoMojibake(value, label) {
  if (typeof value === 'string') {
    assert.equal(hasMojibake(value), false, `${label} contains mojibake: ${value}`);
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

function assertUrlOrAnchor(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.ok(
    value === '#' || value.startsWith('https://') || value.startsWith('mailto:'),
    `${label} must be an https URL, mailto link, or private # anchor`,
  );
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = 40) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(500);
  }
  throw lastError;
}

async function readJsonFromRuntime(route) {
  const response = await fetchWithRetry(new URL(route, baseUrl));
  assert.match(response.headers.get('content-type') ?? '', /json/i, `${route} must serve JSON`);
  return response.json();
}

async function pathExists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findBrowserPath() {
  for (const candidate of chromeCandidates) {
    if (candidate && await pathExists(candidate)) return candidate;
    if (candidate && !candidate.includes(path.sep) && commandExists(candidate)) return candidate;
  }
  throw new Error(`No Chrome, Chromium, or Edge executable found for screenshot proof. Set PORTFOLIO_CHROME_PATH. Checked: ${chromeCandidates.join(', ')}`);
}

function commandExists(command) {
  if (process.platform === 'win32') {
    return spawnSync('where.exe', [command], { stdio: 'ignore' }).status === 0;
  }

  return spawnSync('sh', ['-c', `command -v "$1" >/dev/null 2>&1`, 'sh', command], { stdio: 'ignore' }).status === 0;
}

async function waitForDevTools(port) {
  const endpoint = `http://127.0.0.1:${port}/json/version`;
  let lastError;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return response.json();
      lastError = new Error(`${endpoint} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw lastError;
}

async function createPageTarget(port) {
  const endpoint = `http://127.0.0.1:${port}/json/new?about:blank`;
  let response = await fetch(endpoint, { method: 'PUT' });
  if (!response.ok) {
    response = await fetch(endpoint);
  }
  assert.ok(response.ok, `Chrome target creation failed with ${response.status}`);
  const target = await response.json();
  assert.ok(target.webSocketDebuggerUrl, 'Chrome page target did not expose a debugger URL');
  return target.webSocketDebuggerUrl;
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) {
      reject(new Error(`${message.error.message}: ${message.error.data ?? ''}`));
      return;
    }
    resolve(message.result ?? {});
  });

  return {
    async ready() {
      if (socket.readyState === WebSocket.OPEN) return;
      await new Promise((resolve, reject) => {
        socket.addEventListener('open', resolve, { once: true });
        socket.addEventListener('error', reject, { once: true });
      });
    },
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    close() {
      socket.close();
    },
  };
}

async function waitForText(cdp, text, attempts = 160) {
  const expression = `document.body && document.body.innerText.includes(${JSON.stringify(text)})`;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
    if (result.result?.value === true) return;
    await wait(125);
  }
  throw new Error(`Timed out waiting for visible text: ${text}`);
}

async function installLanguagePreference(cdp, language) {
  return cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try { localStorage.setItem('portfolio-language', ${JSON.stringify(language)}); } catch (_) {}`,
  });
}

async function assertLanguageSwitcherIsClear(cdp, name) {
  const expression = `(() => {
    const switcher = document.querySelector('[data-proof="language-switcher"]') ??
      (() => {
        const buttons = [...document.querySelectorAll('button')]
          .filter((button) => ['EN', 'FR'].includes(button.textContent.trim()));
        return buttons.length >= 2 ? buttons[0].parentElement : null;
      })();
    if (!switcher) return { missing: true, overlaps: [] };
    const a = switcher.getBoundingClientRect();
    const intersects = (b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
    const controls = [...document.querySelectorAll('a, button')]
      .filter((element) => !switcher.contains(element))
      .map((element) => ({ text: element.textContent.trim(), rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight)
      .filter(({ rect }) => intersects(rect))
      .map(({ text }) => text);
    return { missing: false, overlaps: controls };
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  assert.equal(result.result.value.missing, false, `${name} is missing the language switcher`);
  assert.deepEqual(result.result.value.overlaps, [], `${name} language switcher overlaps visible controls`);
}

async function assertRuntimeAnchors(cdp, name) {
  const expression = `(() => {
    const required = ['top', 'projects', 'experience', 'about', 'stack', 'contact'];
    return required.filter((id) => !document.getElementById(id));
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  assert.deepEqual(result.result.value, [], `${name} is missing runtime anchors`);
}

async function assertJourneyEvents(cdp, name) {
  const expression = `(async () => {
    window.__portfolioJourneyEvents = [];
    window.open = () => null;
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest?.('a');
      if (anchor) event.preventDefault();
    }, { capture: true });

    const projectCard = document.querySelector('[data-proof="project-card"]');
    const emailLink = [...document.querySelectorAll('a')]
      .find((anchor) => anchor.href.startsWith('mailto:'));
    const githubLink = [...document.querySelectorAll('a')]
      .find((anchor) => anchor.href.includes('github.com'));
    const frenchButton = [...document.querySelectorAll('[data-proof="language-switcher"] button')]
      .find((button) => button.textContent.trim() === 'FR');

    projectCard?.click();
    emailLink?.click();
    githubLink?.click();
    frenchButton?.click();

    await new Promise((resolve) => setTimeout(resolve, 120));
    return (window.__portfolioJourneyEvents ?? []).map((event) => ({
      name: event.name,
      target: event.target,
      at: event.at,
    }));
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  const events = result.result.value ?? [];
  const names = new Set(events.map((event) => event.name));

  for (const required of ['project_open', 'contact_click', 'external_profile_click', 'language_switch']) {
    assert.equal(names.has(required), true, `${name} did not record ${required}`);
  }

  return events;
}

async function captureScreenshots() {
  const browserPath = await findBrowserPath();
  const debugPort = 41000 + Math.floor(Math.random() * 1000);
  const profileDir = path.join(os.tmpdir(), `portfolio-proof-${Date.now()}`);
  await mkdir(outputDir, { recursive: true });
  await mkdir(profileDir, { recursive: true });

  const browser = spawn(browserPath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${debugPort}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let browserOutput = '';
  browser.stdout.on('data', (chunk) => {
    browserOutput += chunk.toString();
  });
  browser.stderr.on('data', (chunk) => {
    browserOutput += chunk.toString();
  });

  try {
    await waitForDevTools(debugPort);
    const cdp = createCdpClient(await createPageTarget(debugPort));
    await cdp.ready();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const targets = [
      {
        name: 'desktop-en',
        file: `portfolio-${proofLabel}-desktop-en.png`,
        viewport: { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false },
        language: 'en',
        waitText: 'Full-stack engineer',
      },
      {
        name: 'mobile-en',
        file: `portfolio-${proofLabel}-mobile-en.png`,
        viewport: { width: 390, height: 900, deviceScaleFactor: 2, mobile: true },
        language: 'en',
        waitText: 'Email me',
      },
      {
        name: 'mobile-fr',
        file: `portfolio-${proofLabel}-mobile-fr.png`,
        viewport: { width: 390, height: 900, deviceScaleFactor: 2, mobile: true },
        language: 'fr',
        waitText: "M'\u00e9crire",
      },
    ];

    const screenshots = [];
    let journeyEvents = [];
    for (const target of targets) {
      await cdp.send('Emulation.setDeviceMetricsOverride', target.viewport);
      const languagePreference = await installLanguagePreference(cdp, target.language);
      await cdp.send('Page.navigate', { url: baseUrl });
      await waitForText(cdp, 'Xavier Pelchat');
      await cdp.send('Runtime.evaluate', {
        expression: `localStorage.setItem('portfolio-language', ${JSON.stringify(target.language)})`,
      });
      await cdp.send('Page.reload', { ignoreCache: true });
      await waitForText(cdp, target.waitText);
      await cdp.send('Page.removeScriptToEvaluateOnNewDocument', {
        identifier: languagePreference.identifier,
      });
      const metrics = await cdp.send('Runtime.evaluate', {
        expression: '({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, text: document.body.innerText.slice(0, 400) })',
        returnByValue: true,
      });
      await assertRuntimeAnchors(cdp, target.name);
      await assertLanguageSwitcherIsClear(cdp, target.name);
      if (target.name === 'desktop-en') {
        journeyEvents = await assertJourneyEvents(cdp, target.name);
      }
      assert.ok(
        metrics.result.value.scrollWidth <= metrics.result.value.width,
        `${target.name} has horizontal overflow: ${metrics.result.value.scrollWidth} > ${metrics.result.value.width}`,
      );

      const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      const screenshotPath = path.join(outputDir, target.file);
      await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
      screenshots.push({
        name: target.name,
        path: path.relative(root, screenshotPath),
        width: metrics.result.value.width,
        scrollWidth: metrics.result.value.scrollWidth,
        language: target.language,
      });
    }

    cdp.close();
    return { screenshots, journeyEvents };
  } catch (error) {
    throw new Error(`${error.message}\nBrowser output:\n${browserOutput.slice(-2000)}`);
  } finally {
    if (process.platform === 'win32' && browser.pid) {
      spawnSync('taskkill', ['/pid', String(browser.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      browser.kill('SIGTERM');
    }
    try {
      await rm(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
    } catch {
      // Chrome can keep a Windows profile lock briefly after taskkill; proof should not fail on temp cleanup.
    }
  }
}

async function verifyImage(route) {
  const response = await fetchWithRetry(new URL(route, baseUrl), 10);
  const contentType = response.headers.get('content-type') ?? '';
  const bytes = (await response.arrayBuffer()).byteLength;
  assert.match(contentType, /^image\//, `${route} must serve an image`);
  assert.ok(bytes > 1024, `${route} must not be an empty image`);
  return { route, contentType, bytes };
}

async function checkExternalLink(label, href) {
  if (href === '#') return { label, href, status: 'private-anchor' };
  if (href.startsWith('mailto:')) return { label, href, status: 'mailto-format-checked' };

  const attempts = [
    { method: 'HEAD', url: href },
    { method: 'GET', url: href },
  ];

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, {
        method: attempt.method,
        redirect: 'follow',
        headers: { 'user-agent': 'portfolio-runtime-proof/1.0' },
      });
      if (response.status >= 200 && response.status < 400) {
        return { label, href, status: 'live-checked', method: attempt.method, httpStatus: response.status };
      }

      if (/linkedin\.com/i.test(href) && [403, 429, 999].includes(response.status)) {
        return { label, href, status: 'provider-blocked', method: attempt.method, httpStatus: response.status };
      }
    } catch (error) {
      if (/linkedin\.com/i.test(href) && /999|403|429|blocked/i.test(error.message)) {
        return { label, href, status: 'provider-blocked', method: attempt.method, error: error.message };
      }
    }
  }

  throw new Error(`${label} could not be live-checked: ${href}`);
}

async function collectLinks(en, fr) {
  const links = [
    ['email', `mailto:${en.general.socials.email}`],
    ['github', en.general.socials.github],
    ['linkedin', en.general.socials.linkedin],
    ...en.projects.map((project) => [`project:${project.name}`, project.href]),
    ...fr.projects.map((project) => [`projet:${project.name}`, project.href]),
  ];

  for (const [label, href] of links) {
    assertUrlOrAnchor(href, label);
  }

  const uniqueLinks = [...new Map(links.map(([label, href]) => [href, [label, href]])).values()];
  return Promise.all(uniqueLinks.map(([label, href]) => checkExternalLink(label, href)));
}

function startServer() {
  if (providedUrl) return null;

  const child = spawn(process.execPath, [nextCliPath, 'start', '-p', String(port)], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      output += `\nnext start exited with ${code}`;
    }
  });

  return { child, getOutput: () => output.slice(-4000) };
}

async function getCommit() {
  const child = spawn('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  return new Promise((resolve) => {
    child.on('exit', () => resolve(output.trim() || 'unknown'));
  });
}

const server = startServer();

try {
  const htmlResponse = await fetchWithRetry(baseUrl);
  const html = await htmlResponse.text();
  assert.match(html, /Xavier Pelchat/, 'runtime HTML exposes the identity signal');

  const pageSource = await readFile(pagePath, 'utf8');
  for (const anchor of ['top', 'projects', 'experience', 'about', 'stack', 'contact']) {
    assert.ok(pageSource.includes(`id="${anchor}"`), `page source includes #${anchor}`);
  }

  const en = await readJsonFromRuntime('/translations/en.json');
  const fr = await readJsonFromRuntime('/translations/fr.json');
  assertNoMojibake(en, 'en');
  assertNoMojibake(fr, 'fr');
  assert.equal(fr.general.location, 'Qu\u00e9bec, Canada', 'French locale keeps correct accents');
  assert.equal(fr.general.buttons.emailMe, "M'\u00e9crire", 'French contact CTA keeps correct accents');
  assert.equal(fr.general.operatorSignal.steps.includes('V\u00e9rifier'), true, 'French operator loop includes verification');

  assert.ok(en.general.proofPoints.length >= 3, 'English hero proof strip is present');
  assert.ok(fr.general.proofPoints.length >= 3, 'French hero proof strip is present');
  assert.ok(en.projects.length >= 3, 'English selected work is present');
  assert.ok(fr.projects.length >= 3, 'French selected work is present');

  const images = await Promise.all([
    verifyImage('/images/developer-workspace-cutout.png'),
    verifyImage('/images/profile-shoreline.jpg'),
    verifyImage('/images/developer-workspace.png'),
  ]);
  const { screenshots, journeyEvents } = await captureScreenshots();
  const links = await collectLinks(en, fr);
  const commit = await getCommit();

  const proof = {
    schema: 'portfolio-runtime-proof-v1',
    generatedAt: new Date().toISOString(),
    url: baseUrl,
    environment: providedUrl ? proofLabel : 'production-local-next-start',
    commit,
    checks: {
      htmlIdentity: 'pass',
      sourceAnchorContracts: 'pass',
      runtimeAnchorContracts: 'pass',
      translationsServed: 'pass',
      accentIntegrity: 'pass',
      selectedWork: 'pass',
      imageLoading: 'pass',
      linkContracts: 'pass',
      liveExternalLinks: links.some((link) => link.status === 'provider-blocked') ? 'partial-provider-blocked' : 'pass',
      screenshots: 'pass',
      languageSwitcherClear: 'pass',
      telemetry: 'pass-privacy-safe-memory-bus',
      journeyEvents: 'pass',
    },
    images,
    screenshots,
    journeyEvents,
    links,
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(proofJsonPath, `${JSON.stringify(proof, null, 2)}\n`, 'utf8');
  await writeFile(
    proofMdPath,
    [
      '# Portfolio Runtime Proof',
      '',
      `- Date: ${proof.generatedAt}`,
      `- URL: ${proof.url}`,
      `- Environment: ${proof.environment}`,
      `- Commit: ${proof.commit}`,
      '- Result: pass',
      '',
      '## Checks',
      '',
      ...Object.entries(proof.checks).map(([key, value]) => `- ${key}: ${value}`),
      '',
      '## Screenshots',
      '',
      ...screenshots.map((screenshot) => `- ${screenshot.name}: \`${screenshot.path}\` (${screenshot.width}px viewport, ${screenshot.scrollWidth}px scroll width)`),
      '',
      '## Live Links',
      '',
      ...links.map((link) => `- ${link.label}: ${link.status}${link.httpStatus ? ` (${link.httpStatus})` : ''} ${link.href}`),
      '',
      '## Journey Events',
      '',
      ...journeyEvents.map((event) => `- ${event.name}: ${event.target}`),
      '',
      '## Remaining Runtime Gaps',
      '',
      '- No external analytics destination is configured; CTA proof uses the local privacy-safe journey bus.',
      '',
    ].join('\n'),
    'utf8',
  );

  console.log(`portfolio runtime proof: ok -> ${path.relative(root, proofMdPath)}`);
} catch (error) {
  if (server) {
    console.error(server.getOutput());
  }
  throw error;
} finally {
  if (server) {
    if (process.platform === 'win32' && server.child.pid) {
      spawnSync('taskkill', ['/pid', String(server.child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      server.child.kill('SIGTERM');
    }
  }
}
