'use strict';

const fs = require('fs');
const path = require('path');

const EXTENSIONS = ['.ts', '.tsx', '.d.ts', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts', '.json'];

const CACHE_TTL_MS = 5000;

const fileCache = new Map();
const tsconfigCache = new Map();
const resolveCache = new Map();
let cachedAt = 0;

function refreshCaches() {
  const now = Date.now();
  if (now - cachedAt < CACHE_TTL_MS) return;
  fileCache.clear();
  tsconfigCache.clear();
  resolveCache.clear();
  cachedAt = now;
}

function isFile(filePath) {
  let cached = fileCache.get(filePath);
  if (cached === undefined) {
    try {
      cached = fs.statSync(filePath).isFile();
    } catch {
      cached = false;
    }
    fileCache.set(filePath, cached);
  }
  return cached;
}

function probe(basePath) {
  if (isFile(basePath)) return basePath;
  for (const ext of EXTENSIONS) {
    if (isFile(basePath + ext)) return basePath + ext;
  }
  const jsExt = /\.(m|c)?jsx?$/.exec(basePath);
  if (jsExt) {
    const stem = basePath.slice(0, -jsExt[0].length);
    for (const ext of ['.ts', '.tsx', '.mts', '.cts']) {
      if (isFile(stem + ext)) return stem + ext;
    }
  }
  for (const ext of EXTENSIONS) {
    const indexPath = path.join(basePath, `index${ext}`);
    if (isFile(indexPath)) return indexPath;
  }
  return null;
}

function stripJsonComments(source) {
  let result = '';
  let inString = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (inString) {
      result += char;
      if (char === '\\') {
        result += next ?? '';
        i += 1;
      } else if (char === '"') {
        inString = false;
      }
    } else if (char === '"') {
      inString = true;
      result += char;
    } else if (char === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      result += '\n';
    } else if (char === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 1;
    } else {
      result += char;
    }
  }
  return result.replace(/,(\s*[}\]])/g, '$1');
}

function readJsonc(filePath) {
  try {
    return JSON.parse(stripJsonComments(fs.readFileSync(filePath, 'utf8')));
  } catch {
    return null;
  }
}

function resolveExtends(specifier, fromDir) {
  if (specifier.startsWith('.') || path.isAbsolute(specifier)) {
    const candidate = path.resolve(fromDir, specifier);
    return [candidate, `${candidate}.json`, path.join(candidate, 'tsconfig.json')].find(isFile) ?? null;
  }
  const resolveFrom = request => {
    try {
      return require.resolve(request, { paths: [fromDir] });
    } catch {
      return null;
    }
  };
  if (specifier.endsWith('.json')) return resolveFrom(specifier);
  const packageJson = resolveFrom(`${specifier}/package.json`);
  const tsconfigField = packageJson && readJsonc(packageJson)?.tsconfig;
  if (tsconfigField) return path.resolve(path.dirname(packageJson), tsconfigField);
  return resolveFrom(`${specifier}/tsconfig.json`) ?? resolveFrom(`${specifier}.json`);
}

function loadCompilerPaths(tsconfigPath, seen = new Set()) {
  if (!tsconfigPath || seen.has(tsconfigPath)) return { baseUrl: null, paths: null, pathsBase: null };
  seen.add(tsconfigPath);
  const config = readJsonc(tsconfigPath);
  if (!config) return { baseUrl: null, paths: null, pathsBase: null };

  const dir = path.dirname(tsconfigPath);
  const parents = (Array.isArray(config.extends) ? config.extends : [config.extends])
    .filter(Boolean)
    .map(spec => loadCompilerPaths(resolveExtends(spec, dir), seen));

  const merged = parents.reduce(
    (acc, parent) => ({
      baseUrl: parent.baseUrl ?? acc.baseUrl,
      paths: parent.paths ?? acc.paths,
      pathsBase: parent.paths ? parent.pathsBase : acc.pathsBase,
    }),
    { baseUrl: null, paths: null, pathsBase: null },
  );

  const options = config.compilerOptions || {};
  const baseUrl = options.baseUrl !== undefined ? path.resolve(dir, options.baseUrl) : merged.baseUrl;
  if (options.paths) {
    return { baseUrl, paths: options.paths, pathsBase: baseUrl ?? dir };
  }
  return { baseUrl, paths: merged.paths, pathsBase: merged.paths ? (baseUrl ?? merged.pathsBase) : null };
}

function splitAtStar(target) {
  const star = target.indexOf('*');
  return {
    path: target,
    star: star !== -1,
    prefix: star === -1 ? target : target.slice(0, star),
    suffix: star === -1 ? '' : target.slice(star + 1),
  };
}

function getPathsConfig(rootPath) {
  let cached = tsconfigCache.get(rootPath);
  if (!cached) {
    const tsconfigPath = path.join(rootPath, 'tsconfig.json');
    const loaded = isFile(tsconfigPath) ? loadCompilerPaths(tsconfigPath) : { baseUrl: null, paths: null };
    const patterns = Object.entries(loaded.paths || {}).map(([pattern, targets]) => {
      const star = pattern.indexOf('*');
      return {
        prefix: star === -1 ? pattern : pattern.slice(0, star),
        suffix: star === -1 ? '' : pattern.slice(star + 1),
        wildcard: star !== -1,
        targets: targets.map(target => splitAtStar(path.resolve(loaded.pathsBase, target))),
      };
    });
    patterns.sort((a, b) => b.prefix.length - a.prefix.length);
    cached = { baseUrl: loaded.baseUrl, patterns };
    tsconfigCache.set(rootPath, cached);
  }
  return cached;
}

function matchPaths(source, patterns) {
  for (const { prefix, suffix, wildcard, targets } of patterns) {
    let captured = null;
    if (!wildcard && source === prefix) captured = '';
    if (
      wildcard &&
      source.startsWith(prefix) &&
      source.endsWith(suffix) &&
      source.length >= prefix.length + suffix.length
    ) {
      captured = source.slice(prefix.length, source.length - suffix.length);
    }
    if (captured !== null) {
      for (const target of targets) {
        const resolved = probe(wildcard && target.star ? `${target.prefix}${captured}${target.suffix}` : target.path);
        if (resolved) return resolved;
      }
    }
  }
  return null;
}

function resolveUncached(source, importer, rootPath) {
  const clean = source.split('?')[0];
  if (clean.startsWith('.')) return probe(path.resolve(path.dirname(importer), clean));
  if (path.isAbsolute(clean)) return probe(clean);

  const { baseUrl, patterns } = getPathsConfig(rootPath);
  const fromPaths = matchPaths(clean, patterns);
  if (fromPaths) return fromPaths;
  if (baseUrl && !clean.startsWith('@') && !clean.startsWith('#')) return probe(path.resolve(baseUrl, clean));
  return null;
}

function resolveImport(source, importer, rootPath) {
  refreshCaches();
  const key = `${importer}\0${source}`;
  if (!resolveCache.has(key)) resolveCache.set(key, resolveUncached(source, importer, rootPath));
  return resolveCache.get(key);
}

module.exports = { resolveImport };
