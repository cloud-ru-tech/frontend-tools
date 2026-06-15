#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

const SOLIDARITY_CONFIG_PATH = path.resolve(process.cwd(), '.solidarity');

const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

function loadSolidarityConfig() {
  if (!fs.existsSync(SOLIDARITY_CONFIG_PATH)) {
    console.error(`Solidarity config not found at ${SOLIDARITY_CONFIG_PATH}`);
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(SOLIDARITY_CONFIG_PATH, 'utf8'));
}

function formatError(template, { installedVersion, wantedVersion }) {
  return template.replaceAll('{{installedVersion}}', installedVersion).replaceAll('{{wantedVersion}}', wantedVersion);
}

function getWantedVersion(range) {
  return semver.minVersion(range)?.version ?? range;
}

function getCliVersion(binary, versionFlag = '--version') {
  const output = execSync(`${binary} ${versionFlag}`, { encoding: 'utf8' }).trim();
  const version = semver.coerce(output);

  if (!version) {
    throw new Error(`Unable to parse ${binary} version from "${output}"`);
  }

  return version.version;
}

function getRuleLabel(rule) {
  if (rule.rule === 'cli') {
    return `'${rule.binary}' binary ${rule.semver}`;
  }

  if (rule.rule === 'shell') {
    return `'${rule.command}' matches '${rule.match}'`;
  }

  return `Unsupported rule: ${rule.rule}`;
}

function checkCliRule(rule) {
  try {
    const installedVersion = getCliVersion(rule.binary, rule.version);

    if (!semver.satisfies(installedVersion, rule.semver)) {
      return {
        ok: false,
        error: formatError(rule.error, {
          installedVersion,
          wantedVersion: getWantedVersion(rule.semver),
        }),
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function checkShellRule(rule) {
  try {
    const output = execSync(rule.command, { encoding: 'utf8' }).trim();
    const pattern = new RegExp(rule.match);

    if (!pattern.test(output)) {
      return { ok: false, error: rule.error };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: rule.error ?? (error instanceof Error ? error.message : String(error)),
    };
  }
}

function checkRule(rule) {
  if (rule.rule === 'cli') {
    return checkCliRule(rule);
  }

  if (rule.rule === 'shell') {
    return checkShellRule(rule);
  }

  return { ok: false, error: `Unsupported solidarity rule: ${rule.rule}` };
}

function printGroupResult(groupName, results) {
  const groupPassed = results.every(({ result }) => result.ok);
  const groupColor = groupPassed ? green : red;
  const groupIcon = groupPassed ? '✔' : '✖';

  console.info(`${groupColor}${groupIcon}${reset} ${groupName}`);

  for (const { rule, result } of results) {
    const ruleColor = result.ok ? green : red;
    const ruleIcon = result.ok ? '✔' : '✖';

    console.info(`  ${ruleColor}${ruleIcon}${reset} ${getRuleLabel(rule)}`);

    if (!result.ok && result.error) {
      console.info(`  ${red}→${reset} ${result.error}`);
    }
  }

  return groupPassed;
}

const config = loadSolidarityConfig();
const requirements = config.requirements ?? {};
const groupResults = [];

for (const [groupName, rules] of Object.entries(requirements)) {
  const results = rules.map(rule => ({ rule, result: checkRule(rule) }));

  groupResults.push({ groupName, results });
}

const hasFailures = groupResults.some(({ results }) => results.some(({ result }) => !result.ok));

if (hasFailures) {
  for (const { groupName, results } of groupResults) {
    printGroupResult(groupName, results);
  }

  console.error(`${red}Solidarity checks failed${reset}`);
  process.exit(2);
}
