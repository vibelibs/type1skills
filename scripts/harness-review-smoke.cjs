#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const explicitReviewRoot = process.env.TYPE1SKILLS_REVIEW_ROOT;
const reviewRoot = explicitReviewRoot
  ? path.resolve(explicitReviewRoot)
  : fs.mkdtempSync(path.join(os.tmpdir(), 'type1skills-harness-review-'));
const homeDir = process.env.HOME || os.homedir();
const resultsRoot = path.resolve(process.env.TYPE1SKILLS_RESULTS_ROOT || '/review/results');
const strictEnv = process.env.TYPE1SKILLS_STRICT_ENV !== '0';
const rawBin = process.env.TYPE1SKILLS_BIN || 'type1skills';
const localBinPath = rawBin.endsWith('.cjs') || rawBin.endsWith('.js') ? path.resolve(rawBin) : null;
const command = localBinPath ? process.execPath : rawBin;
const commandPrefix = localBinPath ? [localBinPath] : [];

const expectedSkills = [
  'approve-incubating.md',
  'closeout-enforcer.md',
  'cook-idea.md',
  'new-ideas.md',
  'release-enforcer.md',
  'review.md',
  'solve-next-todo.md',
  'spark-to-ship.md',
];

const expectedPluginFiles = [
  'ideas-radar/plugin.json',
  'ideas-radar/app/index.html',
  'ideas-radar/skills/ideas-radar.md',
  'ideas-radar/schemas/ideas-radar.snapshot.schema.json',
  'skill-matrix/plugin.json',
  'skill-matrix/app/index.html',
  'skill-matrix/skills/skill-matrix.md',
  'skill-matrix/schemas/skill-matrix.snapshot.schema.json',
];

const findMySkillsProducts = [
  { rank: 1, name: 'TrueHacking', category: 'Seguranca', votes: 79, featured: true, source: 'verified', flags: 0 },
  { rank: 2, name: 'LeakGuard', category: 'Seguranca', votes: 44, featured: true, source: 'verified', flags: 1 },
  { rank: 3, name: 'BaixaTube', category: 'Utilitarios', votes: 37, featured: true, source: 'unknown', flags: 2 },
  { rank: 4, name: 'Porno Legendado +18', category: 'Adulto', votes: 34, featured: true, source: 'unknown', flags: 4, adult: true },
  { rank: 5, name: 'Ape Platform.com', category: 'Inteligencia Artificial', votes: 10, featured: true, source: 'verified', flags: 0 },
  { rank: 6, name: 'Radar OnWav', category: 'Financas / Fintech', votes: 6, featured: true, source: 'verified', flags: 0 },
  { rank: 7, name: 'WikiNerd', category: 'Entretenimento', votes: 13, featured: false, source: 'verified', flags: 0 },
  { rank: 8, name: 'Loyalts', category: 'Marketing', votes: 10, featured: false, source: 'unknown', flags: 1 },
  { rank: 9, name: 'DevGrana - MVP', category: 'Financas / Fintech', votes: 6, featured: false, source: 'verified', flags: 0 },
  { rank: 10, name: 'ZapLigue', category: 'Marketing', votes: 5, featured: false, source: 'unknown', flags: 0 },
];

function log(message = '') {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`\nHarness review failed: ${message}\n`);
  process.exit(1);
}

function assertNoAgentLeakage() {
  if (!strictEnv) {
    return;
  }

  const forbiddenEnvNames = Object.keys(process.env).filter((name) => {
    return /^(CODEX|CLAUDE|ANTHROPIC|OPENAI|COPILOT)_/i.test(name)
      || /^(GH_TOKEN|GITHUB_TOKEN|NPM_TOKEN|GOOGLE_API_KEY|AZURE_OPENAI_API_KEY)$/i.test(name);
  });

  if (forbiddenEnvNames.length > 0) {
    fail(`agent or credential environment leaked into the review container: ${forbiddenEnvNames.join(', ')}`);
  }

  const forbiddenHomePaths = [
    '.codex',
    '.claude',
    '.config/github-copilot',
    '.config/Code/User/globalStorage/github.copilot-chat',
  ];
  const leakedHomePaths = forbiddenHomePaths
    .map((entry) => path.join(homeDir, entry))
    .filter((entry) => fs.existsSync(entry));

  if (leakedHomePaths.length > 0) {
    fail(`agent home configuration leaked into the review container: ${leakedHomePaths.join(', ')}`);
  }
}

function commandEnv() {
  const allowed = ['PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'TMPDIR', 'TEMP', 'TMP'];
  const env = {};

  for (const key of allowed) {
    if (process.env[key]) {
      env[key] = process.env[key];
    }
  }

  env.HOME = homeDir;
  env.npm_config_update_notifier = 'false';
  env.npm_config_fund = 'false';
  return env;
}

function runType1Skills(label, args, options = {}) {
  log(`> ${label}`);
  const result = spawnSync(command, [...commandPrefix, ...args], {
    cwd: reviewRoot,
    env: commandEnv(),
    encoding: 'utf8',
  });

  const stdout = result.stdout.trim();
  const stderr = result.stderr.trim();

  if (stdout) {
    log(stdout);
  }

  if (stderr) {
    log(stderr);
  }

  const expectedStatus = options.expectFailure ? 'failure' : 'success';
  const passed = options.expectFailure ? result.status !== 0 : result.status === 0;

  if (!passed) {
    fail(`${label} expected ${expectedStatus}, got exit ${result.status ?? 'null'}`);
  }

  if (options.includes && !`${stdout}\n${stderr}`.includes(options.includes)) {
    fail(`${label} output did not include "${options.includes}"`);
  }

  return { stdout, stderr, status: result.status };
}

function resetReviewProject() {
  fs.rmSync(reviewRoot, { recursive: true, force: true });
  fs.mkdirSync(reviewRoot, { recursive: true });
  fs.writeFileSync(path.join(reviewRoot, 'README.md'), '# Product Review Sandbox\n', 'utf8');
  fs.writeFileSync(
    path.join(reviewRoot, 'package.json'),
    JSON.stringify({ name: 'product-review-sandbox', private: true }, null, 2).concat('\n'),
    'utf8',
  );
}

function assertFile(relativePath) {
  const absolutePath = path.join(reviewRoot, relativePath);

  if (!fs.existsSync(absolutePath)) {
    fail(`expected ${relativePath} to exist`);
  }

  const stats = fs.statSync(absolutePath);

  if (!stats.isFile() || stats.size === 0) {
    fail(`expected ${relativePath} to be a non-empty file`);
  }
}

function assertHarnessOutput() {
  for (const fileName of expectedSkills) {
    assertFile(path.join('.type1skills', 'skills', fileName));
  }

  for (const fileName of expectedPluginFiles) {
    assertFile(path.join('.type1skills', 'plugins', fileName));
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function writeFindMySkillsWebsite() {
  const siteDir = path.join(resultsRoot, 'find-my-skills');
  const websitePath = path.join(siteDir, 'index.html');
  const productCards = findMySkillsProducts
    .filter((product) => product.featured)
    .map((product) => [
      `        <article class="skill-card${product.adult ? ' age-gate-blur' : ''}" data-controller="${product.adult ? 'age-gate ' : ''}auth-prompt">`,
      `          <div class="skill-logo" aria-hidden="true">${escapeHtml(product.name.slice(0, 2).toUpperCase())}</div>`,
      `          <div>`,
      `            <h3>${escapeHtml(product.name)}</h3>`,
      `            <p>${escapeHtml(product.category)}</p>`,
      '          </div>',
      `          <span>${product.votes} votos</span>`,
      product.adult ? '          <small>18+ protegido por blur ate confirmacao de idade.</small>' : '',
      '        </article>',
    ].filter(Boolean).join('\n'))
    .join('\n');
  const tableRows = findMySkillsProducts.map((product) => [
    '          <tr>',
    `            <td>#${product.rank}</td>`,
    `            <td><strong>${escapeHtml(product.name)}</strong>${product.adult ? '<span class="age-pill">18+</span>' : ''}</td>`,
    `            <td>${escapeHtml(product.category)}</td>`,
    `            <td><span id="vote-count-${product.rank}">${product.votes}</span></td>`,
    `            <td><span class="${product.source === 'verified' ? 'good' : 'warn'}">${product.source === 'verified' ? 'Legit GitHub' : 'Source review'}</span></td>`,
    `            <td>${product.flags > 0 ? `${product.flags} flag(s)` : 'Clear'}</td>`,
    '            <td>',
    `              <form action="/products/${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/vote" method="post" data-controller="vote" data-turbo-stream="true">`,
    '                <input type="hidden" name="vote[kind]" value="upvote">',
    `                <button type="submit" aria-label="Upvote ${escapeHtml(product.name)}">Vote</button>`,
    '              </form>',
    `              <button class="ghost" data-controller="auth-prompt" type="button">Flag risky listing</button>`,
    '            </td>',
    '          </tr>',
  ].join('\n')).join('\n');

  const html = `<!doctype html>
<html lang="pt-BR" data-controller="theme">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Produtos em destaque &mdash; Find My Skills</title>
  <meta name="description" content="Descubra, compare e vote em skills, SaaS e ferramentas de aprendizado com sinais de legitimidade e seguranca.">
  <meta property="og:title" content="Produtos em destaque &mdash; Find My Skills">
  <meta property="og:description" content="Usuarios descobrem e votam em skills ou learning tools com flags de risco e verificacao de fonte.">
  <meta property="og:url" content="https://find-my-skills.com/">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Produtos em destaque &mdash; Find My Skills">
  <meta name="twitter:description" content="Ranking de skills com votos, categorias, conteudo adulto protegido e verificacao de fonte.">
  <link rel="canonical" href="https://find-my-skills.com/">
  <style>
    :root { color-scheme: light; --ink: #172026; --muted: #5f6b73; --line: #d8e0e7; --panel: #ffffff; --paper: #f7f9fb; --teal: #0f766e; --blue: #2563eb; --amber: #b7791f; --red: #b91c1c; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header, main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 0; }
    nav a, nav button { color: var(--ink); font-weight: 750; text-decoration: none; }
    nav button, form button, .ghost { border: 1px solid var(--line); border-radius: 6px; background: #fff; cursor: pointer; padding: 0.48rem 0.7rem; }
    .brand { font-size: 1.15rem; font-weight: 900; }
    .nav-links { display: flex; align-items: center; flex-wrap: wrap; gap: 0.8rem; }
    .avatar { width: 34px; height: 34px; border-radius: 999px; background: linear-gradient(135deg, var(--teal), var(--blue)); color: #fff; display: inline-grid; font-weight: 900; place-items: center; }
    .flash { border: 1px solid #bae6fd; border-radius: 8px; background: #e0f2fe; color: #075985; margin: 0.5rem 0 1rem; padding: 0.75rem 1rem; }
    .hero { display: grid; gap: 1rem; padding: 1.5rem 0 1rem; }
    h1 { font-size: clamp(2rem, 5vw, 4.3rem); line-height: 1; margin: 0; }
    h2 { margin: 0 0 0.75rem; }
    .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; margin: 1rem 0; padding: 1rem; }
    .featured-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.8rem; }
    .skill-card { border: 1px solid var(--line); border-radius: 8px; display: grid; gap: 0.7rem; min-height: 150px; padding: 0.85rem; }
    .skill-logo { align-items: center; background: #ecfeff; border-radius: 8px; color: var(--teal); display: flex; font-weight: 900; height: 48px; justify-content: center; width: 48px; }
    .age-gate-blur { filter: blur(2px); position: relative; }
    .age-pill { background: #fee2e2; border-radius: 999px; color: var(--red); display: inline-block; font-size: 0.72rem; font-weight: 900; margin-left: 0.45rem; padding: 0.12rem 0.38rem; }
    .decision-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 0.8rem; }
    .decision { border-left: 5px solid var(--teal); background: #f8fafc; border-radius: 8px; padding: 0.75rem; }
    .table-wrap { overflow-x: auto; }
    table { border-collapse: collapse; min-width: 880px; width: 100%; }
    th, td { border-bottom: 1px solid var(--line); padding: 0.75rem; text-align: left; vertical-align: top; }
    th { color: var(--muted); font-size: 0.78rem; text-transform: uppercase; }
    .good { color: var(--teal); font-weight: 850; }
    .warn { color: var(--amber); font-weight: 850; }
    .ghost { color: var(--muted); margin-left: 0.35rem; }
    @media (max-width: 760px) { nav { align-items: flex-start; flex-direction: column; } .nav-links { align-items: flex-start; } }
  </style>
  <script type="importmap">{"imports":{"@hotwired/turbo-rails":"/assets/turbo.js","controllers/vote_controller":"/assets/controllers/vote_controller.js","controllers/theme_controller":"/assets/controllers/theme_controller.js","controllers/auth_prompt_controller":"/assets/controllers/auth_prompt_controller.js","controllers/logo_crop_controller":"/assets/controllers/logo_crop_controller.js","controllers/screenshot_upload_controller":"/assets/controllers/screenshot_upload_controller.js","controllers/age_gate_controller":"/assets/controllers/age_gate_controller.js"}}</script>
</head>
<body>
  <header>
    <nav aria-label="Primary navigation">
      <a class="brand" href="/">Find My Skills</a>
      <div class="nav-links">
        <a href="/categories">Categorias</a>
        <a href="/products">Meus produtos</a>
        <a href="/products/new">Cadastrar skill</a>
        <span class="avatar" aria-label="Rafael product engineer profile">R</span>
        <button type="button">Sair</button>
      </div>
    </nav>
    <div class="flash" role="status">login: Bem-vindo, Rafael!</div>
    <section class="hero">
      <p>Produto criado pelo Type1Skills clean-room harness para testar decisoes Type 1 antes de gastar tokens em arquitetura irreversivel.</p>
      <h1>Produtos em destaque</h1>
    </section>
  </header>
  <main>
    <section class="panel">
      <h2>Tipo 1 gates preservados</h2>
      <div class="decision-grid">
        <div class="decision"><strong>Stack reversivel</strong><br>Static-first MVP; Rails/Hotwire fica como decisao posterior quando auth e votacao real tiverem evidencia.</div>
        <div class="decision"><strong>Voto sem abuso</strong><br>Componentes usam contratos de voto, mas producao exige limite por usuario, auditoria e protecao contra automacao.</div>
        <div class="decision"><strong>Conteudo sensivel</strong><br>Skills adultas ficam desfocadas e sinalizadas antes de qualquer detalhe visual.</div>
        <div class="decision"><strong>Fonte legitima</strong><br>GitHub/source legitimacy e flag de risco aparecem antes de promover produtos.</div>
      </div>
    </section>
    <section class="panel">
      <h2>Em Destaque</h2>
      <div class="featured-grid" data-controller="logo-crop screenshot-upload">
${productCards}
      </div>
    </section>
    <section class="panel">
      <h2>Produtos em destaque</h2>
      <p>Ordenacao demonstra destaque/trending antes de voto bruto: WikiNerd tem 13 votos, mas aparece depois de Radar OnWav por nao estar em destaque.</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Rank</th><th>Skill</th><th>Category</th><th>Votes</th><th>Source</th><th>Flags</th><th>Action</th></tr>
          </thead>
          <tbody>
${tableRows}
          </tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>
`;

  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(websitePath, html, 'utf8');
  return websitePath;
}

function writeUseCaseEvidence(websitePath) {
  const evidencePath = path.join(resultsRoot, 'uc-084-find-my-skills-product-review.json');
  const evidence = {
    useCaseId: 'UC-084',
    persona: 'Rafael, senior developer becoming a product engineer',
    product: 'Find My Skills',
    journey: [
      'enters Type1Skills site',
      'installs spark, review, Ideas Radar, and Skill Matrix packs',
      'asks the harness for a low-cost skills ranking MVP',
      'holds Type 1 decisions for stack, auth, voting, adult content, source legitimacy, and token budget',
      'creates a static-first website artifact before committing to Rails/Hotwire production architecture',
    ],
    type1DecisionGates: [
      'reversible static-first MVP before Rails/Hotwire commitment',
      'no real CSRF tokens or logged-in profile URLs in shared artifacts',
      'adult listings blurred and marked',
      'source legitimacy and user flags visible',
      'vote contract present without claiming production abuse protection',
    ],
    artifact: path.relative(resultsRoot, websitePath).split(path.sep).join('/'),
  };

  fs.mkdirSync(resultsRoot, { recursive: true });
  fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2).concat('\n'), 'utf8');
  return evidencePath;
}

function writeReport(versionOutput, websitePath, useCaseEvidencePath) {
  const report = {
    status: 'passed',
    useCaseId: 'UC-084',
    reviewRoot,
    homeDir,
    strictEnv,
    version: versionOutput.trim(),
    installedSkills: expectedSkills,
    installedPlugins: ['@type1skills/ideas-radar', '@type1skills/skill-matrix'],
    productReview: {
      persona: 'Rafael, senior developer becoming a product engineer',
      product: 'Find My Skills',
      websiteArtifact: path.relative(resultsRoot, websitePath).split(path.sep).join('/'),
      useCaseEvidence: path.relative(resultsRoot, useCaseEvidencePath).split(path.sep).join('/'),
    },
  };
  const reportPath = path.join(resultsRoot, 'harness-review.json');

  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2).concat('\n'), 'utf8');
    log(`Report: ${reportPath}`);
  } catch (error) {
    log(`Report skipped: ${error.message}`);
  }
}

assertNoAgentLeakage();
resetReviewProject();

log('Type1Skills harness review');
log(`Review project: ${reviewRoot}`);
log(`Home: ${homeDir}`);
log('');

const version = runType1Skills('type1skills --version', ['--version']).stdout;
runType1Skills('type1skills plugin list', ['plugin', 'list'], { includes: '@type1skills/skill-matrix' });
runType1Skills('reject unknown package', ['install', '@type1skills/not-real'], {
  expectFailure: true,
  includes: 'Unknown Type1Skills package',
});
runType1Skills('install @type1skills/spark', ['install', '@type1skills/spark'], {
  includes: 'spark-to-ship.md',
});
runType1Skills('install @type1skills/review', ['install', '@type1skills/review'], {
  includes: 'review.md',
});
runType1Skills('install @type1skills/ideas-radar plugin', ['plugin', 'install', '@type1skills/ideas-radar'], {
  includes: 'ideas-radar.snapshot.schema.json',
});
runType1Skills('install @type1skills/skill-matrix plugin', ['plugin', 'install', '@type1skills/skill-matrix'], {
  includes: 'skill-matrix.snapshot.schema.json',
});

assertHarnessOutput();
const websitePath = writeFindMySkillsWebsite();
const useCaseEvidencePath = writeUseCaseEvidence(websitePath);
assertNoAgentLeakage();
writeReport(version, websitePath, useCaseEvidencePath);

log('');
log('Harness review passed.');
