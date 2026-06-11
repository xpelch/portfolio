import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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

async function assertFirstViewportDecisionSurface(cdp, target) {
  const expression = `((requiredTexts) => {
    const visible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        Number(style.opacity) > 0 &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      );
    };
    const hasVisibleText = (text) => [...document.querySelectorAll('a, button, h1, h2, h3, p, span')]
      .some((element) => visible(element) && element.textContent.includes(text));
    const proofItems = [...document.querySelectorAll('#top [class*="grid"] div')]
      .filter((element) => visible(element) && element.textContent.trim().length > 0);
    return {
      missingTexts: requiredTexts.filter((text) => !hasVisibleText(text)),
      proofItemCount: proofItems.length,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    };
  })(${JSON.stringify(target.firstViewportTexts)})`;
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  const value = result.result.value;
  assert.deepEqual(value.missingTexts, [], `${target.name} first viewport is missing required decision text`);
  assert.ok(value.proofItemCount >= 3, `${target.name} first viewport does not expose the hero proof strip`);
  return value;
}

async function assertAccessibilitySmoke(cdp, target) {
  const expression = `(() => {
    const visible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        Number(style.opacity) > 0 &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      );
    };
    const nameOf = (element) => (
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent ||
      element.getAttribute('alt') ||
      ''
    ).trim();
    const controls = [...document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(visible);
    const namelessControls = controls
      .filter((element) => nameOf(element).length === 0)
      .map((element) => element.tagName.toLowerCase());
    const undersizedControls = controls
      .map((element) => ({ name: nameOf(element), rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width < 24 || rect.height < 24)
      .map(({ name, rect }) => ({ name, width: Math.round(rect.width), height: Math.round(rect.height) }));
    const duplicateIds = [...document.querySelectorAll('[id]')]
      .map((element) => element.id)
      .filter((id, index, ids) => ids.indexOf(id) !== index);
    const imagesMissingAlt = [...document.querySelectorAll('img')]
      .filter(visible)
      .filter((image) => !image.hasAttribute('alt'))
      .map((image) => image.currentSrc || image.src || 'img');
    const unfocusable = [];
    const focused = [];
    for (const control of controls.slice(0, 12)) {
      control.focus({ preventScroll: true });
      if (document.activeElement === control || control.contains(document.activeElement)) {
        focused.push(nameOf(control));
      } else {
        unfocusable.push(nameOf(control) || control.tagName.toLowerCase());
      }
    }
    return {
      landmarks: {
        main: Boolean(document.querySelector('main')),
        h1: Boolean(document.querySelector('h1')),
        labeledNav: Boolean(document.querySelector('nav[aria-label]')),
      },
      visibleControlCount: controls.length,
      focusedCount: focused.length,
      namelessControls,
      undersizedControls,
      duplicateIds: [...new Set(duplicateIds)],
      imagesMissingAlt,
      focused,
    };
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  const value = result.result.value;
  assert.equal(value.landmarks.main, true, `${target.name} is missing a main landmark`);
  assert.equal(value.landmarks.h1, true, `${target.name} is missing an h1`);
  assert.equal(value.landmarks.labeledNav, true, `${target.name} is missing labeled primary navigation`);
  assert.ok(value.visibleControlCount >= 4, `${target.name} exposes too few visible controls`);
  assert.deepEqual(value.namelessControls, [], `${target.name} has visible controls without accessible names`);
  assert.deepEqual(value.undersizedControls, [], `${target.name} has undersized visible controls`);
  assert.deepEqual(value.duplicateIds, [], `${target.name} has duplicate ids`);
  assert.deepEqual(value.imagesMissingAlt, [], `${target.name} has visible images without alt text`);
  assert.ok(value.focusedCount >= Math.min(4, value.visibleControlCount), `${target.name} keyboard focus smoke failed`);
  return value;
}

const performanceBudget = {
  domContentLoadedMs: 3500,
  loadCompleteMs: 6000,
  responseEndMs: 3500,
  resourceCount: 70,
  transferKiB: 2500,
  largestResourceKiB: 1500,
};

async function waitForDocumentComplete(cdp, name) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const result = await cdp.send('Runtime.evaluate', {
      expression: 'document.readyState',
      returnByValue: true,
    });
    if (result.result.value === 'complete') return;
    await wait(125);
  }
  throw new Error(`${name} document did not reach complete readyState`);
}

async function assertPerformanceBudget(cdp, target) {
  await waitForDocumentComplete(cdp, target.name);
  const expression = `(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const paintEntries = Object.fromEntries(
      performance.getEntriesByType('paint').map((entry) => [entry.name, Math.round(entry.startTime)])
    );
    const transferBytes = resources.reduce((total, item) => total + (item.transferSize || 0), 0);
    const largestResourceBytes = resources.reduce((max, item) => Math.max(max, item.transferSize || item.decodedBodySize || 0), 0);
    const navValue = (key) => Math.max(0, Math.round(navigation?.[key] ?? 0));
    return {
      domContentLoadedMs: navValue('domContentLoadedEventEnd'),
      loadCompleteMs: navValue('loadEventEnd') || navValue('domComplete') || Math.round(performance.now()),
      responseEndMs: navValue('responseEnd'),
      firstContentfulPaintMs: paintEntries['first-contentful-paint'] ?? null,
      resourceCount: resources.length,
      transferKiB: Math.round(transferBytes / 1024),
      largestResourceKiB: Math.round(largestResourceBytes / 1024),
    };
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  const metrics = result.result.value;
  assert.ok(metrics.domContentLoadedMs <= performanceBudget.domContentLoadedMs, `${target.name} DOMContentLoaded exceeded budget: ${metrics.domContentLoadedMs}ms`);
  assert.ok(metrics.loadCompleteMs <= performanceBudget.loadCompleteMs, `${target.name} load complete exceeded budget: ${metrics.loadCompleteMs}ms`);
  assert.ok(metrics.responseEndMs <= performanceBudget.responseEndMs, `${target.name} response end exceeded budget: ${metrics.responseEndMs}ms`);
  assert.ok(metrics.resourceCount <= performanceBudget.resourceCount, `${target.name} resource count exceeded budget: ${metrics.resourceCount}`);
  assert.ok(metrics.transferKiB <= performanceBudget.transferKiB, `${target.name} transfer size exceeded budget: ${metrics.transferKiB}KiB`);
  assert.ok(metrics.largestResourceKiB <= performanceBudget.largestResourceKiB, `${target.name} largest resource exceeded budget: ${metrics.largestResourceKiB}KiB`);
  return { name: target.name, budget: performanceBudget, ...metrics };
}

async function assertCommandDeckWorkflow(cdp, target) {
  const expression = `(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitFor = async (predicate) => {
      for (let attempt = 0; attempt < 80; attempt += 1) {
        const value = predicate();
        if (value) return value;
        await sleep(50);
      }
      return null;
    };

    const trigger = document.querySelector('[data-proof="command-deck-trigger"]');
    if (!trigger) return { missingTrigger: true };

    trigger.focus({ preventScroll: true });
    trigger.click();
    const dialog = await waitFor(() => document.querySelector('[data-proof="command-deck"]'));
    const activeInside = await waitFor(() => dialog?.contains(document.activeElement));
    const closeButton = dialog?.querySelector('[data-proof="command-deck-close"]');
    const commandButtons = dialog ? [...dialog.querySelectorAll('button')].filter((button) => button !== closeButton) : [];
    const initialFocus = document.activeElement?.textContent?.trim() ?? '';
    const closeLabel = closeButton?.getAttribute('aria-label') ?? '';

    closeButton?.click();
    await waitFor(() => !document.querySelector('[data-proof="command-deck"]'));
    await waitFor(() => document.activeElement === trigger);
    const restoredAfterClose = document.activeElement === trigger;

    trigger.click();
    await waitFor(() => document.querySelector('[data-proof="command-deck"]'));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await waitFor(() => !document.querySelector('[data-proof="command-deck"]'));
    await waitFor(() => document.activeElement === trigger);
    const restoredAfterEscape = document.activeElement === trigger;

    return {
      missingTrigger: false,
      dialogRole: dialog?.getAttribute('role') ?? '',
      modal: dialog?.getAttribute('aria-modal') ?? '',
      labelledBy: dialog?.getAttribute('aria-labelledby') ?? '',
      describedBy: dialog?.getAttribute('aria-describedby') ?? '',
      closeLabel,
      commandCount: commandButtons.length,
      activeInside: Boolean(activeInside),
      initialFocus,
      restoredAfterClose,
      restoredAfterEscape,
    };
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  const value = result.result.value;
  assert.equal(value.missingTrigger, false, `${target.name} is missing command deck trigger`);
  assert.equal(value.dialogRole, 'dialog', `${target.name} command deck is not a dialog`);
  assert.equal(value.modal, 'true', `${target.name} command deck is not modal`);
  assert.equal(Boolean(value.labelledBy), true, `${target.name} command deck is missing aria-labelledby`);
  assert.equal(Boolean(value.describedBy), true, `${target.name} command deck is missing aria-describedby`);
  assert.equal(Boolean(value.closeLabel), true, `${target.name} command deck close button needs an accessible name`);
  assert.ok(value.commandCount >= 6, `${target.name} command deck exposes too few commands`);
  assert.equal(value.activeInside, true, `${target.name} command deck did not move focus inside`);
  assert.equal(value.restoredAfterClose, true, `${target.name} command deck did not restore focus after close`);
  assert.equal(value.restoredAfterEscape, true, `${target.name} command deck did not restore focus after Escape`);
  return { name: target.name, ...value };
}

async function assertProjectCardAffordances(cdp, target) {
  const expression = `(() => {
    const cards = [...document.querySelectorAll('[data-proof="project-card"]')];
    const privateCards = cards.filter((card) => card.getAttribute('data-project-state') === 'private');
    const publicCards = cards.filter((card) => card.getAttribute('data-project-state') === 'public');
    return {
      cardCount: cards.length,
      privateCount: privateCards.length,
      publicCount: publicCards.length,
      privateAnchors: privateCards.filter((card) => card.tagName.toLowerCase() === 'a' || card.getAttribute('href') === '#').length,
      publicAnchors: publicCards.filter((card) => card.tagName.toLowerCase() === 'a' && card.getAttribute('href')?.startsWith('https://')).length,
      deadProjectLinks: cards.filter((card) => card.tagName.toLowerCase() === 'a' && card.getAttribute('href') === '#').length,
    };
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  const value = result.result.value;
  assert.ok(value.cardCount >= 3, `${target.name} exposes too few project cards`);
  assert.ok(value.privateCount >= 1, `${target.name} should expose a private project card`);
  assert.ok(value.publicCount >= 2, `${target.name} should expose public project cards`);
  assert.equal(value.privateAnchors, 0, `${target.name} private project cards must not be dead links`);
  assert.equal(value.deadProjectLinks, 0, `${target.name} has dead project card links`);
  assert.equal(value.publicAnchors, value.publicCount, `${target.name} public project cards must remain external links`);
  return { name: target.name, ...value };
}

async function assertJourneyEvents(cdp, name, { requireSink }) {
  const expression = `(async () => {
    window.__portfolioJourneyEvents = [];
    window.__portfolioJourneyAcks = [];
    window.open = () => null;
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest?.('a');
      if (anchor) event.preventDefault();
    }, { capture: true });

    const projectCard = document.querySelector('[data-proof="project-card"][data-project-state="public"]');
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

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const ackNames = new Set((window.__portfolioJourneyAcks ?? []).map((ack) => ack.name));
      if (
        ackNames.has('project_open') &&
        ackNames.has('contact_click') &&
        ackNames.has('external_profile_click') &&
        ackNames.has('language_switch')
      ) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 125));
    }

    return {
      events: (window.__portfolioJourneyEvents ?? []).map((event) => ({
        name: event.name,
        target: event.target,
        at: event.at,
      })),
      acknowledgements: (window.__portfolioJourneyAcks ?? []).map((ack) => ({
        ok: ack.ok,
        name: ack.name,
        target: ack.target,
        receivedAt: ack.receivedAt,
      })),
    };
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  const events = result.result.value?.events ?? [];
  const acknowledgements = result.result.value?.acknowledgements ?? [];
  const names = new Set(events.map((event) => event.name));
  const ackNames = new Set(acknowledgements.map((ack) => ack.name));

  for (const required of ['project_open', 'contact_click', 'external_profile_click', 'language_switch']) {
    assert.equal(names.has(required), true, `${name} did not record ${required}`);
    if (requireSink) {
      assert.equal(ackNames.has(required), true, `${name} did not receive server acknowledgement for ${required}`);
    }
  }

  return { events, acknowledgements };
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
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
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
        firstViewportTexts: ['Xavier Pelchat', 'Full-stack engineer', 'View work', 'Email me', 'GitHub'],
      },
      {
        name: 'mobile-en',
        file: `portfolio-${proofLabel}-mobile-en.png`,
        viewport: { width: 390, height: 900, deviceScaleFactor: 2, mobile: true },
        language: 'en',
        waitText: 'Email me',
        firstViewportTexts: ['Xavier Pelchat', 'Email me'],
      },
      {
        name: 'mobile-fr',
        file: `portfolio-${proofLabel}-mobile-fr.png`,
        viewport: { width: 390, height: 900, deviceScaleFactor: 2, mobile: true },
        language: 'fr',
        waitText: "M'\u00e9crire",
        firstViewportTexts: ['Xavier Pelchat', "M'\u00e9crire"],
      },
    ];

    const screenshots = [];
    const firstViewport = [];
    const accessibility = [];
    const performance = [];
    const commandDeck = [];
    const projectCards = [];
    let journeyEvents = [];
    let journeyAcks = [];
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
      firstViewport.push({ name: target.name, ...await assertFirstViewportDecisionSurface(cdp, target) });
      accessibility.push({ name: target.name, ...await assertAccessibilitySmoke(cdp, target) });
      performance.push(await assertPerformanceBudget(cdp, target));
      commandDeck.push(await assertCommandDeckWorkflow(cdp, target));
      projectCards.push(await assertProjectCardAffordances(cdp, target));
      if (target.name === 'desktop-en') {
        const journeyProof = await assertJourneyEvents(cdp, target.name, { requireSink: Boolean(providedUrl) });
        journeyEvents = journeyProof.events;
        journeyAcks = journeyProof.acknowledgements;
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
    return { screenshots, firstViewport, accessibility, performance, commandDeck, projectCards, journeyEvents, journeyAcks };
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

async function writeAutogrowthJourneySignal(proof) {
  const signalDir = path.join(root, '.autogrowth', 'signals', 'analytics');
  await mkdir(signalDir, { recursive: true });
  const signalPath = path.join(signalDir, `portfolio-${proofLabel}-journey-latest.json`);
  const signal = {
    schema: 'portfolio-journey-analytics-signal-v1',
    generatedAt: proof.generatedAt,
    sourceProof: path.relative(root, proofJsonPath),
    environment: proof.environment,
    url: proof.url,
    commit: proof.commit,
    result: 'pass',
    analytics: {
      eventNames: [...new Set(proof.journeyEvents.map((event) => event.name))],
      acknowledgedEventNames: [...new Set(proof.journeyAcks.map((ack) => ack.name))],
      eventCount: proof.journeyEvents.length,
      acknowledgementCount: proof.journeyAcks.length,
    },
    performance: {
      budget: proof.performanceBudget,
      viewports: proof.performance.map((item) => ({
        name: item.name,
        domContentLoadedMs: item.domContentLoadedMs,
        loadCompleteMs: item.loadCompleteMs,
        responseEndMs: item.responseEndMs,
        firstContentfulPaintMs: item.firstContentfulPaintMs,
        resourceCount: item.resourceCount,
        transferKiB: item.transferKiB,
        largestResourceKiB: item.largestResourceKiB,
      })),
    },
    commandDeck: proof.commandDeck.map((item) => ({
      name: item.name,
      commandCount: item.commandCount,
      dialogRole: item.dialogRole,
      modal: item.modal,
      activeInside: item.activeInside,
      restoredAfterClose: item.restoredAfterClose,
      restoredAfterEscape: item.restoredAfterEscape,
    })),
    projectCards: proof.projectCards.map((item) => ({
      name: item.name,
      cardCount: item.cardCount,
      privateCount: item.privateCount,
      publicCount: item.publicCount,
      deadProjectLinks: item.deadProjectLinks,
    })),
    privacy: {
      storesTargets: false,
      storesUserIdentifiers: false,
      storesIpAddress: false,
      storesUserAgent: false,
    },
  };
  await writeFile(signalPath, `${JSON.stringify(signal, null, 2)}\n`, 'utf8');
  return path.relative(root, signalPath);
}

async function writeIntegratedProductionProof(proof) {
  if (!providedUrl) return null;

  const proofDir = path.join(root, '.autogrowth', 'product-proof');
  await mkdir(proofDir, { recursive: true });
  const integratedPath = path.join(proofDir, 'integrated-production-proof.json');
  const integrated = {
    schema: 'portfolio-integrated-production-proof-v2',
    generatedAt: proof.generatedAt,
    url: proof.url,
    environment: proof.environment,
    commit: proof.commit,
    result: 'pass',
    sourceArtifacts: {
      runtimeProofJson: path.relative(root, proofJsonPath),
      runtimeProofMarkdown: path.relative(root, proofMdPath),
      autogrowthSignal: proof.autogrowthSignal,
    },
    checks: proof.checks,
    screenshots: proof.screenshots.map((item) => ({
      name: item.name,
      path: item.path,
      width: item.width,
      scrollWidth: item.scrollWidth,
      language: item.language,
    })),
    firstViewport: proof.firstViewport.map((item) => ({
      name: item.name,
      proofItemCount: item.proofItemCount,
      viewport: item.viewport,
    })),
    accessibility: proof.accessibility.map((item) => ({
      name: item.name,
      visibleControlCount: item.visibleControlCount,
      focusedCount: item.focusedCount,
      landmarks: item.landmarks,
      namelessControls: item.namelessControls,
      undersizedControls: item.undersizedControls,
      duplicateIds: item.duplicateIds,
      imagesMissingAlt: item.imagesMissingAlt,
    })),
    performance: {
      budget: proof.performanceBudget,
      viewports: proof.performance.map((item) => ({
        name: item.name,
        domContentLoadedMs: item.domContentLoadedMs,
        loadCompleteMs: item.loadCompleteMs,
        responseEndMs: item.responseEndMs,
        firstContentfulPaintMs: item.firstContentfulPaintMs,
        resourceCount: item.resourceCount,
        transferKiB: item.transferKiB,
        largestResourceKiB: item.largestResourceKiB,
      })),
    },
    commandDeck: proof.commandDeck.map((item) => ({
      name: item.name,
      commandCount: item.commandCount,
      restoredAfterClose: item.restoredAfterClose,
      restoredAfterEscape: item.restoredAfterEscape,
    })),
    projectCards: proof.projectCards.map((item) => ({
      name: item.name,
      privateCount: item.privateCount,
      publicCount: item.publicCount,
      deadProjectLinks: item.deadProjectLinks,
    })),
    journeyEvents: {
      eventNames: [...new Set(proof.journeyEvents.map((event) => event.name))],
      acknowledgedEventNames: [...new Set(proof.journeyAcks.map((ack) => ack.name))],
      eventCount: proof.journeyEvents.length,
      acknowledgementCount: proof.journeyAcks.length,
    },
    linkHealth: proof.links.map((item) => ({
      label: item.label,
      status: item.status,
      httpStatus: item.httpStatus ?? null,
    })),
    privacy: {
      storesTargets: false,
      storesUserIdentifiers: false,
      storesIpAddress: false,
      storesUserAgent: false,
    },
    nextAction: 'Keep this packet fresh after every deployed UI/content change; next cap is privacy-safe aggregate visitor telemetry.',
  };
  await writeFile(integratedPath, `${JSON.stringify(integrated, null, 2)}\n`, 'utf8');
  return path.relative(root, integratedPath);
}

async function readLatestCiSignal(commit) {
  const ciDir = path.join(root, '.autogrowth', 'signals', 'ci');
  try {
    const files = (await readdir(ciDir)).filter((file) => file.endsWith('.json'));
    const signals = [];
    for (const file of files) {
      try {
        const value = JSON.parse(await readFile(path.join(ciDir, file), 'utf8'));
        signals.push({ file, value });
      } catch {
        // Ignore malformed historical signals; the latest proof should reflect usable evidence only.
      }
    }

    signals.sort((a, b) => {
      const left = Date.parse(a.value.updatedAt ?? a.value.createdAt ?? '');
      const right = Date.parse(b.value.updatedAt ?? b.value.createdAt ?? '');
      return (Number.isNaN(left) ? 0 : left) - (Number.isNaN(right) ? 0 : right);
    });

    const matching = signals.find(({ value }) => {
      const headSha = typeof value.headSha === 'string' ? value.headSha : '';
      return headSha.startsWith(commit) || JSON.stringify(value).includes(commit);
    });
    const latest = signals.at(-1);
    const source = matching ?? latest;

    return {
      status: matching ? 'observed-current' : latest ? 'observed-stale' : 'missing',
      source: source ? path.join('.autogrowth', 'signals', 'ci', source.file) : null,
      commitMatched: Boolean(matching),
      conclusion: source?.value?.conclusion ?? null,
      runUrl: source?.value?.url ?? null,
      note: matching
        ? 'CI signal matches the proof commit.'
        : 'No CI signal matched the proof commit; the 92 cap remains active until remote CI evidence is refreshed.',
    };
  } catch {
    return {
      status: 'missing',
      source: null,
      commitMatched: false,
      conclusion: null,
      runUrl: null,
      note: 'No CI signal directory is available; the 92 cap remains active.',
    };
  }
}

async function readScoreContext() {
  const fallback = {
    currentScore: 90,
    activeCap: '92 cap: observed CI artifacts and connector-backed or durable field visitor-intent evidence are missing.',
  };

  try {
    const evaluation = await readFile(path.join(root, 'EVALUATION.md'), 'utf8');
    const scoreMatch = evaluation.match(/# SCORE ACTUEL:\s*(\d+)\/100/i)
      ?? evaluation.match(/- Score actuel\s*:\s*(\d+)\/100/i);
    const capMatch = evaluation.match(/- Active cap\s*:\s*([^\r\n]+)/i)
      ?? evaluation.match(/- Plafond actif\s*:\s*([^\r\n]+)/i);
    return {
      currentScore: scoreMatch ? Number(scoreMatch[1]) : fallback.currentScore,
      activeCap: capMatch ? capMatch[1].replace(/\.+$/, '.').trim() : fallback.activeCap,
    };
  } catch {
    return fallback;
  }
}

async function writeLatestProof(proof) {
  if (!providedUrl) return null;

  const proofDir = path.join(root, '.autogrowth', 'product-proof');
  await mkdir(proofDir, { recursive: true });
  const latestPath = path.join(proofDir, 'latest-proof.json');
  const ci = await readLatestCiSignal(proof.commit);
  const scoreContext = await readScoreContext();
  const latest = {
    schema: 'portfolio-latest-proof-v1',
    generatedAt: proof.generatedAt,
    scoreContext: {
      currentScore: scoreContext.currentScore,
      activeCap: scoreContext.activeCap,
      capStatus: ci.commitMatched ? 'partially-lifted-ci-current-field-evidence-missing' : 'active',
    },
    subject: {
      product: 'bilingual developer portfolio',
      url: proof.url,
      environment: proof.environment,
      commit: proof.commit,
      result: 'pass',
    },
    sourceArtifacts: {
      runtimeProofJson: path.relative(root, proofJsonPath),
      runtimeProofMarkdown: path.relative(root, proofMdPath),
      integratedProductionProof: proof.integratedProductionProof,
      autogrowthSignal: proof.autogrowthSignal,
    },
    proofSummary: {
      checksPassed: Object.values(proof.checks).filter((value) => String(value).startsWith('pass')).length,
      checksPartial: Object.values(proof.checks).filter((value) => String(value).startsWith('partial')).length,
      screenshots: proof.screenshots.length,
      viewports: proof.screenshots.map((item) => ({
        name: item.name,
        width: item.width,
        scrollWidth: item.scrollWidth,
        language: item.language,
      })),
      accessibility: {
        viewports: proof.accessibility.length,
        namelessControls: proof.accessibility.reduce((total, item) => total + item.namelessControls.length, 0),
        undersizedControls: proof.accessibility.reduce((total, item) => total + item.undersizedControls.length, 0),
        duplicateIds: proof.accessibility.reduce((total, item) => total + item.duplicateIds.length, 0),
        imagesMissingAlt: proof.accessibility.reduce((total, item) => total + item.imagesMissingAlt.length, 0),
      },
      performance: {
        budget: proof.performanceBudget,
        worstLoadCompleteMs: Math.max(...proof.performance.map((item) => item.loadCompleteMs)),
        worstTransferKiB: Math.max(...proof.performance.map((item) => item.transferKiB)),
      },
      commandDeck: {
        viewports: proof.commandDeck.length,
        minCommandCount: Math.min(...proof.commandDeck.map((item) => item.commandCount)),
        focusRestoredEverywhere: proof.commandDeck.every((item) => item.restoredAfterClose && item.restoredAfterEscape),
      },
      projectCards: {
        deadProjectLinks: proof.projectCards.reduce((total, item) => total + item.deadProjectLinks, 0),
        privateCardsWithoutDeadAnchors: proof.projectCards.every((item) => item.privateAnchors === 0),
      },
      journeyEvents: {
        eventNames: [...new Set(proof.journeyEvents.map((event) => event.name))],
        acknowledgedEventNames: [...new Set(proof.journeyAcks.map((ack) => ack.name))],
        eventCount: proof.journeyEvents.length,
        acknowledgementCount: proof.journeyAcks.length,
      },
      linkHealth: proof.links.map((item) => ({
        label: item.label,
        status: item.status,
        httpStatus: item.httpStatus ?? null,
      })),
    },
    fieldEvidence: {
      ci,
      telemetry: {
        status: 'smoke-proof-production-endpoint',
        durableVisitorIntentSource: 'missing',
        source: proof.autogrowthSignal,
        note: 'Journey acknowledgements prove the production endpoint contract; durable field visitor-intent evidence still requires an external analytics or log source.',
      },
    },
    privacy: {
      storesTargets: false,
      storesUserIdentifiers: false,
      storesIpAddress: false,
      storesUserAgent: false,
    },
    nextAction: ci.commitMatched
      ? 'Attach durable visitor-intent telemetry from a connector-backed or production-log source.'
      : 'Refresh CI evidence for this commit, then attach durable visitor-intent telemetry from a connector-backed or production-log source.',
  };
  await writeFile(latestPath, `${JSON.stringify(latest, null, 2)}\n`, 'utf8');
  return path.relative(root, latestPath);
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
  const { screenshots, firstViewport, accessibility, performance, commandDeck, projectCards, journeyEvents, journeyAcks } = await captureScreenshots();
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
      projectCardAffordance: 'pass',
      imageLoading: 'pass',
      linkContracts: 'pass',
      liveExternalLinks: links.some((link) => link.status === 'provider-blocked') ? 'partial-provider-blocked' : 'pass',
      screenshots: 'pass',
      firstViewportDecisionSurface: 'pass',
      accessibilitySmoke: 'pass',
      performanceBudget: 'pass',
      commandDeckKeyboard: 'pass',
      languageSwitcherClear: 'pass',
      telemetry: 'pass-privacy-safe-memory-bus',
      journeyEvents: 'pass',
      journeyEventSink: providedUrl ? 'pass-production-acknowledged' : 'not-required-local-runtime',
    },
    images,
    screenshots,
    firstViewport,
    accessibility,
    performanceBudget,
    performance,
    commandDeck,
    projectCards,
    journeyEvents,
    journeyAcks,
    links,
  };
  proof.autogrowthSignal = await writeAutogrowthJourneySignal(proof);
  proof.integratedProductionProof = await writeIntegratedProductionProof(proof);
  proof.latestProof = await writeLatestProof(proof);

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
      '## First Viewport Decision Surface',
      '',
      ...firstViewport.map((viewport) => `- ${viewport.name}: ${viewport.proofItemCount} visible proof items, ${viewport.viewport.width}x${viewport.viewport.height}`),
      '',
      '## Accessibility Smoke',
      '',
      ...accessibility.map((item) => `- ${item.name}: ${item.visibleControlCount} visible controls, ${item.focusedCount} focusable, landmarks main/h1/nav pass`),
      '',
      '## Performance Budget',
      '',
      ...performance.map((item) => `- ${item.name}: DCL ${item.domContentLoadedMs}ms, load ${item.loadCompleteMs}ms, response ${item.responseEndMs}ms, transfer ${item.transferKiB}KiB, ${item.resourceCount} resources`),
      '',
      '## Command Deck Keyboard',
      '',
      ...commandDeck.map((item) => `- ${item.name}: ${item.commandCount} commands, focus restored after close and Escape`),
      '',
      '## Project Card Affordance',
      '',
      ...projectCards.map((item) => `- ${item.name}: ${item.privateCount} private non-link card, ${item.publicCount} public links, ${item.deadProjectLinks} dead links`),
      '',
      '## Live Links',
      '',
      ...links.map((link) => `- ${link.label}: ${link.status}${link.httpStatus ? ` (${link.httpStatus})` : ''} ${link.href}`),
      '',
      '## Journey Events',
      '',
      ...journeyEvents.map((event) => `- ${event.name}: ${event.target}`),
      '',
      '## Journey Event Sink',
      '',
      ...journeyAcks.map((ack) => `- ${ack.name}: ${ack.target} (${ack.ok ? 'accepted' : 'rejected'})`),
      '',
      '## Autogrowth Signal',
      '',
      `- ${proof.autogrowthSignal}`,
      ...(proof.integratedProductionProof ? ['', '## Integrated Production Proof', '', `- ${proof.integratedProductionProof}`] : []),
      ...(proof.latestProof ? ['', '## Latest Proof Control Artifact', '', `- ${proof.latestProof}`] : []),
      '',
      '## Remaining Runtime Gaps',
      '',
      providedUrl
        ? '- No external analytics destination is configured; CTA proof uses the deployed privacy-safe journey endpoint.'
        : '- Endpoint acknowledgement is verified by `proof:production`; local runtime proof verifies the browser journey bus.',
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
