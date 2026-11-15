#!/usr/bin/env node
// Создаёт GitHub Release для каждого тега пакета вида `<name>@<version>`,
// у которого ещё нет релиза. Текст релиза — секция этой версии из
// CHANGELOG.md пакета на коммите тега.
//
// Скрипт идемпотентен: повторный запуск пропускает теги с готовым релизом.
// Теги, коммит которых ещё не входит в ветку `HEAD` (теги запушены, а ветка
// ещё нет), пропускаются и обрабатываются следующим запуском.
//
// Переменные окружения:
//   GITHUB_REPOSITORY  owner/repo (в Actions задаётся автоматически)
//   GH_TOKEN           токен с правом contents: write (для gh)
//   RELEASES_SINCE     ISO-дата: теги, созданные раньше, не рассматриваются
//   RELEASES_MAX       максимум релизов за запуск (по умолчанию 100)
//   DRY_RUN            "true" — только вывести план, ничего не создавать

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = process.env.GITHUB_REPOSITORY;
const since = new Date(process.env.RELEASES_SINCE || '1970-01-01T00:00:00Z');
const max = Number(process.env.RELEASES_MAX || 100);
const dryRun = process.env.DRY_RUN === 'true';

if (!repo) throw new Error('GITHUB_REPOSITORY is not set');
if (Number.isNaN(since.getTime())) throw new Error(`Invalid RELEASES_SINCE: ${process.env.RELEASES_SINCE}`);

const TAG_RE = /^((?:@[^/@]+\/)?[^@]+)@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
// Заголовок версии: `# 1.2.0 (дата)`, `## 1.0.16 (дата)`, `## <small>2.1.2 (дата)</small>`,
// `### v1.0.0` (ранние записи).
const VERSION_HEADING_RE = /^#{1,3} (?:<small>)?v?\[?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\]?[\s(<]/;
const HEADING_RE = /^(#{1,6}) /;

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts }).trim();
const git = (...args) => run('git', args);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function isAncestorOfHead(sha) {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', sha, 'HEAD'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// name -> каталог пакета по текущему состоянию ветки.
function readPackageDirs() {
  const dirs = new Map();
  for (const entry of readdirSync('packages', { withFileTypes: true })) {
    const manifest = join('packages', entry.name, 'package.json');
    if (!entry.isDirectory() || !existsSync(manifest)) continue;
    dirs.set(JSON.parse(readFileSync(manifest, 'utf8')).name, join('packages', entry.name));
  }
  return dirs;
}

function changelogSection(sha, dir, version) {
  let text;
  try {
    text = git('show', `${sha}:${dir}/CHANGELOG.md`);
  } catch {
    return null;
  }
  const lines = text.split('\n');
  const start = lines.findIndex(line => VERSION_HEADING_RE.exec(line)?.[1] === version);
  if (start === -1) return null;
  // Секция заканчивается на следующей версии или на заголовке h1/h2 (например,
  // `## Unreleased`): lerna пишет minor/major через `#`, а patch через `##`, так
  // что уровни не вложены. Для ранних `### vX` граница — заголовок до h3.
  const level = Math.max(HEADING_RE.exec(lines[start])[1].length, 2);
  let end = lines.findIndex((line, i) => {
    if (i <= start) return false;
    const heading = HEADING_RE.exec(line);
    return VERSION_HEADING_RE.test(line) || (heading && heading[1].length <= level);
  });
  if (end === -1) end = lines.length;
  const body = lines
    .slice(start + 1, end)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return body || null;
}

function existingReleaseTags() {
  const out = run('gh', ['api', '--paginate', `repos/${repo}/releases?per_page=100`, '--jq', '.[].tag_name']);
  return new Set(out ? out.split('\n') : []);
}

// Все теги пакетов с коммитом и датой создания, от старых к новым.
function listTags() {
  const out = git(
    'for-each-ref',
    '--sort=creatordate',
    '--format=%(refname:strip=2)%09%(objectname)%09%(*objectname)%09%(creatordate:iso-strict)',
    'refs/tags',
  );
  return out
    .split('\n')
    .filter(Boolean)
    .map(line => {
      // Для аннотированного тега %(*objectname) — коммит, для лёгкого поле пустое.
      const [tag, object, peeled, date] = line.split('\t');
      const sha = peeled || object;
      const match = TAG_RE.exec(tag);
      return match && { tag, sha, date: new Date(date), name: match[1], version: match[2] };
    })
    .filter(Boolean);
}

async function main() {
  const packageDirs = readPackageDirs();
  const released = existingReleaseTags();
  const allTags = listTags();

  const previousTag = new Map();
  const lastByName = new Map();
  for (const t of allTags) {
    if (lastByName.has(t.name)) previousTag.set(t.tag, lastByName.get(t.name));
    lastByName.set(t.name, t.tag);
  }

  const pending = allTags.filter(t => t.date >= since && !released.has(t.tag));
  let created = 0;
  let deferred = 0;

  for (const t of pending) {
    if (created >= max) {
      console.info(`Limit of ${max} releases reached, the rest will be created on the next run.`);
      break;
    }
    if (!isAncestorOfHead(t.sha)) {
      deferred += 1;
      console.info(`skip ${t.tag}: ${t.sha.slice(0, 9)} is not on the branch yet`);
      continue;
    }

    const dir = packageDirs.get(t.name) ?? join('packages', t.name.replace(/^@[^/]+\//, ''));
    const section = changelogSection(t.sha, dir, t.version);
    const prev = previousTag.get(t.tag);
    const links = [
      `[CHANGELOG](https://github.com/${repo}/blob/${encodeURIComponent(t.tag)}/${dir}/CHANGELOG.md)`,
      prev &&
        `[${prev}...${t.tag}](https://github.com/${repo}/compare/${encodeURIComponent(prev)}...${encodeURIComponent(t.tag)})`,
    ].filter(Boolean);
    const notes = `${section ?? `No CHANGELOG entry for ${t.version}.`}\n\n---\n\n${links.join(' · ')}\n`;

    if (dryRun) {
      console.info(`\n=== would create ${t.tag} (${t.sha.slice(0, 9)})\n${notes}`);
      created += 1;
      continue;
    }

    const args = [
      'release',
      'create',
      t.tag,
      '--repo',
      repo,
      '--verify-tag',
      '--title',
      t.tag,
      '--notes-file',
      '-',
      '--latest=false',
    ];
    if (t.version.includes('-')) args.push('--prerelease');
    run('gh', args, { input: notes });
    console.info(`created ${t.tag}`);
    created += 1;
    // Пауза снижает риск secondary rate limit при массовом создании.
    await sleep(1000);
  }

  console.info(
    `\nDone: ${dryRun ? 'planned' : 'created'} ${created}, deferred ${deferred}, already released ${released.size}.`,
  );
}

await main();
