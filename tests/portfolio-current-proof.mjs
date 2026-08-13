import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const proofStartedAt = Date.now();
const maxSourceArtifactAgeMs = 15 * 60 * 1000;

async function readJson(relativePath) {
  const text = await readFile(path.join(root, relativePath), 'utf8');
  return JSON.parse(text.replace(/^\uFEFF/, ''));
}

async function readOptionalJson(relativePath) {
  try {
    return await readJson(relativePath);
  } catch {
    return null;
  }
}

function shortSha(sha) {
  return String(sha).slice(0, 7);
}

function assertFreshArtifact(artifact, label) {
  const generatedAt = Date.parse(artifact.generatedAt);
  assert.equal(Number.isFinite(generatedAt), true, `${label} generatedAt is missing or invalid`);

  const ageMs = proofStartedAt - generatedAt;
  assert.ok(ageMs >= 0, `${label} generatedAt is in the future`);
  assert.ok(
    ageMs <= maxSourceArtifactAgeMs,
    `${label} is stale; run proof:production before proof:current`,
  );
}

async function readScoreContext() {
  const evaluation = await readFile(path.join(root, 'EVALUATION.md'), 'utf8');
  const score = Number(evaluation.match(/# SCORE ACTUEL:\s*(\d+)\/100/i)?.[1] ?? 0);
  const activeCap = evaluation.match(/- Active cap\s*:\s*([^\r\n]+)/i)?.[1]
    ?? evaluation.match(/- Plafond actif\s*:\s*([^\r\n]+)/i)?.[1]
    ?? 'unknown';
  return { score, activeCap };
}

const [
  ciProof,
  productionProof,
  latestProof,
  integratedProof,
  autogrowthProductProof,
  scoreContext,
] = await Promise.all([
  readJson('.autogrowth/evidence-packets/current-proof/github-actions.json'),
  readJson('logs/visual/portfolio-production-proof.json'),
  readJson('.autogrowth/product-proof/latest-proof.json'),
  readJson('.autogrowth/product-proof/integrated-production-proof.json'),
  readOptionalJson('.autogrowth/product-proof/latest.json'),
  readScoreContext(),
]);

const currentCommit = shortSha(ciProof.headSha);
assertFreshArtifact(productionProof, 'production proof');
assertFreshArtifact(latestProof, 'latest proof');
assertFreshArtifact(integratedProof, 'integrated production proof');

assert.equal(ciProof.status, 'pass', 'current CI proof is not passing');
assert.equal(ciProof.run.conclusion, 'success', 'current CI run is not successful');
assert.equal(productionProof.checks.screenshots, 'pass', 'production proof screenshots are not passing');
assert.equal(productionProof.checks.firstViewportDecisionSurface, 'pass', 'production first viewport proof is not passing');
assert.equal(productionProof.checks.accessibilitySmoke, 'pass', 'production accessibility proof is not passing');
assert.equal(productionProof.checks.performanceBudget, 'pass', 'production performance proof is not passing');
assert.equal(latestProof.fieldEvidence.ci.conclusion, 'success', 'latest proof CI evidence is not successful');

const localProofCommit = shortSha(productionProof.commit);
const latestProofCommit = shortSha(latestProof.subject.commit);
const integratedProofCommit = shortSha(integratedProof.commit);

assert.equal(localProofCommit, currentCommit, 'production proof local checkout commit does not match current CI');
assert.equal(latestProofCommit, currentCommit, 'latest proof local checkout commit does not match current CI');
assert.equal(integratedProofCommit, currentCommit, 'integrated proof local checkout commit does not match current CI');
assert.equal(latestProof.fieldEvidence.ci.commitMatched, true, 'latest proof does not match CI evidence');

const currentPacket = {
  schema: 'portfolio-current-proof-v1',
  generatedAt: new Date().toISOString(),
  status: 'pass',
  scoreContext,
  subject: {
    product: 'bilingual developer portfolio',
    url: productionProof.url,
    environment: productionProof.environment,
    ciCommit: currentCommit,
    deployedCommitVerified: false,
  },
  currentEvidence: {
    ci: {
      status: ciProof.status,
      runUrl: ciProof.run.url,
      runId: ciProof.run.databaseId,
      conclusion: ciProof.run.conclusion,
      source: ciProof.source,
    },
    productionJourney: {
      result: 'pass',
      localProofCommit,
      latestProofCommit,
      integratedProofCommit,
      deployedCommit: null,
      deployedCommitVerification: 'not-available-from-public-runtime',
      runtimeProofJson: 'logs/visual/portfolio-production-proof.json',
      runtimeProofMarkdown: 'logs/visual/portfolio-production-proof.md',
      integratedProductionProof: '.autogrowth/product-proof/integrated-production-proof.json',
      latestProof: '.autogrowth/product-proof/latest-proof.json',
    },
    screenshots: productionProof.screenshots.map((item) => ({
      name: item.name,
      path: item.path,
      width: item.width,
      scrollWidth: item.scrollWidth,
      language: item.language,
    })),
    checks: {
      firstViewportDecisionSurface: productionProof.checks.firstViewportDecisionSurface,
      selectedWork: productionProof.checks.selectedWork,
      languageRecovery: productionProof.checks.languageRecovery,
      accessibilitySmoke: productionProof.checks.accessibilitySmoke,
      performanceBudget: productionProof.checks.performanceBudget,
      journeyEventSink: productionProof.checks.journeyEventSink,
      liveExternalLinks: productionProof.checks.liveExternalLinks,
    },
    autogrowthProductProof: autogrowthProductProof
      ? {
          path: '.autogrowth/product-proof/latest.json',
          status: autogrowthProductProof.status,
          screenshots: autogrowthProductProof.summary?.screenshots ?? 'unknown',
          visualQa: autogrowthProductProof.summary?.visual_qa ?? 'unknown',
          note: autogrowthProductProof.playwright?.reason
            ? `Generic product proof did not capture screenshots: ${autogrowthProductProof.playwright.reason}. Runtime proof screenshots are authoritative for this packet.`
            : 'Generic product proof present.',
        }
      : null,
  },
  residualCap: {
    status: latestProof.fieldEvidence.telemetry.status,
    durableVisitorIntentSource: latestProof.fieldEvidence.telemetry.durableVisitorIntentSource,
    note: latestProof.fieldEvidence.telemetry.note,
    nextAction: latestProof.nextAction,
  },
  privacy: latestProof.privacy,
};

await writeFile(
  path.join(root, '.autogrowth', 'product-proof', 'current.json'),
  `${JSON.stringify(currentPacket, null, 2)}\n`,
  'utf8',
);

console.log('portfolio current proof: ok -> .autogrowth/product-proof/current.json');
