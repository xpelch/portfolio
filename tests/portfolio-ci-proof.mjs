import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = process.cwd();
const branch = process.env.PORTFOLIO_CI_BRANCH ?? 'master';
const runLimit = process.env.PORTFOLIO_CI_RUN_LIMIT ?? '10';
const generatedEvidencePrefixes = ['.autogrowth/', 'logs/'];

async function execText(command, args) {
  const { stdout } = await execFileAsync(command, args, {
    cwd: root,
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 5,
  });
  return stdout.trimEnd();
}

function statusPath(line) {
  const pathText = line.slice(3).trim();
  const renamedPath = pathText.split(' -> ').at(-1);
  return renamedPath.replace(/\\/g, '/');
}

function isGeneratedEvidencePath(filePath) {
  return generatedEvidencePrefixes.some((prefix) => filePath.startsWith(prefix));
}

const worktreeStatus = await execText('git', ['status', '--porcelain']);
const dirtySourceLines = worktreeStatus
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => !isGeneratedEvidencePath(statusPath(line)));

assert.deepEqual(
  dirtySourceLines,
  [],
  [
    'proof:ci requires committed source changes so CI evidence cannot be mistaken',
    'for uncommitted local source changes.',
    ...dirtySourceLines,
  ].join('\n'),
);

const headSha = await execText('git', ['rev-parse', 'HEAD']);
const runsJson = await execText('gh', [
  'run',
  'list',
  '--branch',
  branch,
  '--limit',
  runLimit,
  '--json',
  'conclusion,createdAt,databaseId,displayTitle,headSha,status,updatedAt,url,workflowName',
]);

const runs = JSON.parse(runsJson);
assert.ok(Array.isArray(runs), 'GitHub Actions run list did not return an array');

const matchingRun = runs.find((run) => run.headSha === headSha);
assert.ok(matchingRun, `No GitHub Actions run found for HEAD ${headSha}`);
assert.equal(matchingRun.status, 'completed', `GitHub Actions run ${matchingRun.databaseId} is not completed`);
assert.equal(matchingRun.conclusion, 'success', `GitHub Actions run ${matchingRun.databaseId} did not pass`);

const signal = {
  ...matchingRun,
  recordedAt: new Date().toISOString(),
  evidenceType: 'github-actions-current-head',
  branch,
  headSha,
  localHeadMatched: true,
  worktreeClean: true,
};

const signalDir = path.join(root, '.autogrowth', 'signals', 'ci');
await mkdir(signalDir, { recursive: true });
const signalPath = path.join(signalDir, `github-actions-run-${matchingRun.databaseId}.json`);
await writeFile(signalPath, `${JSON.stringify(signal, null, 2)}\n`, 'utf8');

const packetDir = path.join(root, '.autogrowth', 'evidence-packets', 'current-proof');
await mkdir(packetDir, { recursive: true });
const packetPath = path.join(packetDir, 'github-actions.json');
await writeFile(packetPath, `${JSON.stringify({
  schema: 'portfolio-current-ci-proof-v1',
  recordedAt: signal.recordedAt,
  status: 'pass',
  branch,
  headSha,
  worktreeClean: true,
  run: {
    databaseId: matchingRun.databaseId,
    workflowName: matchingRun.workflowName,
    conclusion: matchingRun.conclusion,
    status: matchingRun.status,
    url: matchingRun.url,
    createdAt: matchingRun.createdAt,
    updatedAt: matchingRun.updatedAt,
  },
  source: path.relative(root, signalPath),
}, null, 2)}\n`, 'utf8');

console.log(`portfolio ci proof: ok -> ${path.relative(root, packetPath)}`);
