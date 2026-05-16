#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(packageRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const skillPacks = new Map([
  ['@type1skills/spark', [
    'spark-to-ship.md',
    'new-ideas.md',
    'cook-idea.md',
    'approve-incubating.md',
    'solve-next-todo.md',
    'closeout-enforcer.md',
    'review.md',
    'release-enforcer.md',
  ]],
  ['@type1skills/ideas', ['new-ideas.md']],
  ['@type1skills/incubator', ['cook-idea.md']],
  ['@type1skills/approval', ['approve-incubating.md']],
  ['@type1skills/todo', ['solve-next-todo.md']],
  ['@type1skills/closeout', ['closeout-enforcer.md']],
  ['@type1skills/review', ['review.md']],
  ['@type1skills/release', ['release-enforcer.md']],
]);

function printHelp() {
  process.stdout.write(`Type1Skills ${packageJson.version}

Usage:
  type1skills install @type1skills/spark
  type1skills install @type1skills/ideas
  type1skills install @type1skills/review
  type1skills --version

Commands:
  install <package>  Activate a bundled Type1Skills pack in .type1skills/skills
  help               Show this help

Type1Skills is an independent Type 1 risk harness for coding agents.
`);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function installPack(packageName) {
  const files = skillPacks.get(packageName);

  if (!files) {
    process.stderr.write(`Unknown Type1Skills package: ${packageName}

Available packages:
  ${Array.from(skillPacks.keys()).join('\n  ')}

Git and third-party package installers are part of the extension contract, but this preview CLI only installs bundled packages.
`);
    process.exit(1);
  }

  const sourceDir = path.join(packageRoot, 'skills');
  const targetDir = path.join(process.cwd(), '.type1skills', 'skills');
  ensureDir(targetDir);

  for (const fileName of files) {
    const sourcePath = path.join(sourceDir, fileName);
    const targetPath = path.join(targetDir, fileName);
    fs.copyFileSync(sourcePath, targetPath);
  }

  process.stdout.write(`Installed ${packageName} into ${path.relative(process.cwd(), targetDir) || targetDir}
${files.map((fileName) => `- ${fileName}`).join('\n')}
`);
}

const [, , command, arg] = process.argv;

if (!command || command === 'help' || command === '--help' || command === '-h') {
  printHelp();
} else if (command === '--version' || command === 'version') {
  process.stdout.write(`${packageJson.version}\n`);
} else if (command === 'install') {
  if (!arg) {
    process.stderr.write('Missing package name. Try: type1skills install @type1skills/spark\n');
    process.exit(1);
  }

  installPack(arg);
} else {
  process.stderr.write(`Unknown command: ${command}\n\n`);
  printHelp();
  process.exit(1);
}
