'use strict';

const path = require('path');

const { DEPENDENCY_RELATIONSHIPS_MAP: REL, Elements, normalizeElementsSelector } = require('@boundaries/elements');
const { resolveImport } = require('./resolver');

const elements = new Elements();
const settingsCache = new WeakMap();
const matcherCache = new Map();

const DEFAULT_DEPENDENCY_NODES = ['import'];

function toArray(value) {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value : [value];
}

function getSettings(context) {
  const raw = context.settings || {};
  let cached = settingsCache.get(raw);
  if (cached) return cached;

  const rootSetting = process.env.ESLINT_PLUGIN_BOUNDARIES_ROOT_PATH || raw['boundaries/root-path'];
  const rootPath = rootSetting ? path.resolve(process.cwd(), rootSetting) : process.cwd();
  const flagAsExternal = raw['boundaries/flag-as-external'] || {};

  cached = {
    rootPath,
    dependencyNodes: toArray(raw['boundaries/dependency-nodes']) || DEFAULT_DEPENDENCY_NODES,
    legacyTemplates: raw['boundaries/legacy-templates'] ?? true,
    matcherOptions: {
      ignorePaths: toArray(raw['boundaries/ignore']),
      includePaths: toArray(raw['boundaries/include']),
      legacyTemplates: raw['boundaries/legacy-templates'] ?? true,
      cache: raw['boundaries/cache'] ?? true,
      rootPath,
      flagAsExternal: {
        unresolvableAlias: flagAsExternal.unresolvableAlias ?? true,
        inNodeModules: flagAsExternal.inNodeModules ?? true,
        outsideRootPath: flagAsExternal.outsideRootPath ?? false,
        customSourcePatterns: flagAsExternal.customSourcePatterns ?? [],
      },
    },
    descriptors: JSON.parse(JSON.stringify(raw['boundaries/elements'] || [])),
  };
  settingsCache.set(raw, cached);
  return cached;
}

function getMatcher(settings) {
  const key = JSON.stringify([settings.descriptors, settings.matcherOptions]);
  let matcher = matcherCache.get(key);
  if (!matcher) {
    matcher = elements.getMatcher(settings.descriptors, settings.matcherOptions);
    matcherCache.set(key, matcher);
  }
  return matcher;
}

function specifiersOf(node) {
  if (node.type === 'ImportDeclaration') {
    return (node.specifiers || [])
      .filter(s => s.type === 'ImportSpecifier' && s.imported)
      .map(s => s.imported.name ?? s.imported.value);
  }
  if (node.type === 'ExportNamedDeclaration') {
    return (node.specifiers || []).map(s => s.exported.name ?? s.exported.value);
  }
  return [];
}

function dependencyVisitors(settings, onDependency) {
  const visitors = {};
  const nodes = new Set(settings.dependencyNodes);
  const visit = (node, sourceNode, kind, nodeKind) => {
    if (!sourceNode || typeof sourceNode.value !== 'string') return;
    onDependency({ node: sourceNode, parent: node, kind, nodeKind });
  };

  if (nodes.has('import')) {
    visitors.ImportDeclaration = node =>
      visit(node, node.source, node.importKind === 'type' ? 'type' : 'value', 'import');
  }
  if (nodes.has('export')) {
    visitors.ExportAllDeclaration = node =>
      visit(node, node.source, node.exportKind === 'type' ? 'type' : 'value', 'export');
    visitors.ExportNamedDeclaration = node =>
      visit(node, node.source, node.exportKind === 'type' ? 'type' : 'value', 'export');
  }
  if (nodes.has('dynamic-import')) {
    visitors.ImportExpression = node =>
      node.source && node.source.type === 'Literal' && visit(node, node.source, 'value', 'dynamic-import');
  }
  if (nodes.has('require')) {
    visitors.CallExpression = node => {
      if (
        node.callee.type === 'Identifier' &&
        node.callee.name === 'require' &&
        node.arguments[0]?.type === 'Literal'
      ) {
        visit(node, node.arguments[0], 'value', 'require');
      }
    };
  }
  return visitors;
}

function dependencyRule(meta, check) {
  return {
    meta: { type: 'problem', ...meta },
    create(context) {
      const settings = getSettings(context);
      const matcher = getMatcher(settings);
      const filename = context.filename ?? context.getFilename();
      const file = matcher.describeElement(filename);
      if (file.isIgnored || !file.type) return {};

      return dependencyVisitors(settings, ({ node, parent, kind, nodeKind }) => {
        const source = node.value;
        const description = matcher.describeDependency({
          from: filename,
          to: resolveImport(source, filename, settings.rootPath) || undefined,
          source,
          kind,
          nodeKind,
          specifiers: specifiersOf(parent),
        });
        check({ context, description, node, settings, matcher, options: context.options[0] });
      });
    },
  };
}

function templateValues(element, importKind) {
  return {
    ...(element?.captured || {}),
    type: element?.type || '',
    internalPath: element?.internalPath || '',
    source: element?.source || '',
    importKind: importKind || '',
  };
}

function replaceTemplate(template, values, namespace) {
  return Object.keys(values).reduce(
    (result, key) => result.replace(new RegExp(`\\$\\{${namespace}\\.${key}\\}`, 'g'), values[key]),
    template,
  );
}

function customMessage(message, description) {
  const { kind } = description.dependency;
  const from = templateValues(description.from, kind);
  const to = templateValues(description.to, kind);
  let result = replaceTemplate(replaceTemplate(message, from, 'file'), to, 'dependency');
  result = replaceTemplate(replaceTemplate(result, from, 'from'), to, 'target');
  if (description.from.parents?.[0]) {
    result = replaceTemplate(result, templateValues(description.from.parents[0], kind), 'file.parent');
    result = replaceTemplate(result, templateValues(description.from.parents[0], kind), 'from.parent');
  }
  if (description.to.parents?.[0]) {
    result = replaceTemplate(result, templateValues(description.to.parents[0], kind), 'dependency.parent');
    result = replaceTemplate(result, templateValues(description.to.parents[0], kind), 'target.parent');
  }
  return result;
}

const quote = value => `'${value}'`;

function elementMessage(element) {
  const captured = element?.captured || {};
  const keys = Object.keys(captured);
  const separator = index => {
    if (index === 0) return ' with';
    return index === keys.length - 1 ? ' and' : ',';
  };
  const capturedMessage = keys.map((key, index) => `${separator(index)} ${key} ${quote(captured[key])}`).join('');
  return `of type ${quote(element?.type)}${capturedMessage}`;
}

function selectorMessage(selector) {
  const selectors = toArray(selector) || [];
  return selectors
    .map(item => {
      if (typeof item === 'string') return `elements of type ${quote(item)}`;
      if (Array.isArray(item)) return `elements of type ${quote(item[0])}`;
      return `elements of type ${quote(item.type)}`;
    })
    .join(', or ');
}

function evaluateRules(rules, description, matcher, settings) {
  let ruleIndexMatching = null;
  let isAllowed = false;

  rules.forEach((rule, index) => {
    const target = rule.from ? 'from' : 'to';
    const policy = rule.from ? 'to' : 'from';
    const denyKey = rule.deny ? 'deny' : 'disallow';
    const templateData = settings.legacyTemplates
      ? {
          ...(description[target].captured || {}),
          from: description.from.captured,
          to: description.to.captured,
        }
      : {};
    const globals = rule.importKind ? { kind: rule.importKind } : {};
    const isMatch = selector => {
      try {
        return matcher.getSelectorMatchingDescription(description, selector, {
          extraTemplateData: templateData,
          dependencySelectorsGlobals: globals,
        }).isMatch;
      } catch {
        return false;
      }
    };

    if (rule[denyKey] && isMatch({ [target]: rule[target], [policy]: rule[denyKey] })) {
      isAllowed = false;
      ruleIndexMatching = index;
    } else if (rule.allow && isMatch({ [target]: rule[target], [policy]: rule.allow })) {
      isAllowed = true;
      ruleIndexMatching = index;
    }
  });

  return { ruleIndexMatching, isAllowed };
}

function checkPolicy(rules, description, matcher, settings, options = {}) {
  const { ruleIndexMatching, isAllowed } = evaluateRules(rules, description, matcher, settings);
  const allowed = ruleIndexMatching === null ? options.default === 'allow' : isAllowed;
  if (allowed) return null;
  const rule = ruleIndexMatching === null ? null : rules[ruleIndexMatching];
  return {
    rule,
    index: rule ? (rule.originalRuleIndex ?? ruleIndexMatching) : -1,
    message: rule?.message || options.message,
  };
}

const elementTypes = dependencyRule(
  { docs: { description: 'Check allowed dependencies between element types' }, schema: false },
  ({ context, description, node, settings, matcher, options }) => {
    const { to } = description;
    if (to.origin !== 'local' || to.isIgnored || to.isUnknown) return;
    if (description.dependency.relationship.to === REL.INTERNAL) return;

    const report = checkPolicy(options?.rules || [], description, matcher, settings, options);
    if (!report) return;

    let message;
    if (report.message) {
      message = customMessage(report.message, description);
    } else if (!report.rule) {
      message = `No rule allowing this dependency was found. File is ${elementMessage(description.from)}. Dependency is ${elementMessage(to)}`;
    } else {
      message = `Importing ${selectorMessage(report.rule.to ?? report.rule.disallow)} is not allowed in ${selectorMessage(report.rule.from)}. Disallowed in rule ${report.index + 1}`;
    }
    context.report({ node, message });
  },
);

function entryPointRules(rules = []) {
  const internalPath = templates => toArray(templates)?.map(template => template.replaceAll('${target.', '${to.'));
  return rules.flatMap((rule, originalRuleIndex) => {
    const targets = normalizeElementsSelector(rule.target);
    const base = { importKind: rule.importKind, message: rule.message, originalRuleIndex };
    const withPath = patterns => targets.map(target => ({ ...target, internalPath: internalPath(patterns) }));
    const result = [];
    if (rule.allow && rule.disallow) {
      result.push({ ...base, to: withPath(rule.allow), allow: ['*'] });
      result.push({ ...base, to: withPath(rule.disallow), disallow: ['*'] });
    }
    if (rule.disallow) {
      result.push({ ...base, to: withPath(rule.disallow), disallow: ['*'] });
    } else if (rule.allow) {
      result.push({ ...base, to: withPath(rule.allow), allow: ['*'] });
    }
    return result;
  });
}

const entryPoint = dependencyRule(
  { docs: { description: 'Check entry point used for each element type' }, schema: false },
  ({ context, description, node, settings, matcher, options }) => {
    const { to } = description;
    if (to.isIgnored || !to.type || description.dependency.relationship.to === REL.INTERNAL) return;

    const report = checkPolicy(entryPointRules(options?.rules), description, matcher, settings, options);
    if (!report) return;

    let message;
    if (report.message) {
      message = customMessage(report.message, description);
    } else if (!report.rule) {
      message = `No rule allows the entry point '${to.internalPath}' in dependencies ${elementMessage(to)}`;
    } else {
      message = `The entry point '${to.internalPath}' is not allowed in ${selectorMessage(report.rule.to)}. Disallowed in rule ${report.index + 1}`;
    }
    context.report({ node, message });
  },
);

const noPrivate = dependencyRule(
  { docs: { description: 'Prevent importing private elements of another element' }, schema: false },
  ({ context, description, node, options }) => {
    const { to } = description;
    const relationship = description.dependency.relationship.to;
    if (
      to.origin === 'local' &&
      !to.isIgnored &&
      to.type &&
      to.parents?.length &&
      relationship !== REL.INTERNAL &&
      relationship !== REL.CHILD &&
      relationship !== REL.SIBLING &&
      (!options?.allowUncles || relationship !== REL.UNCLE)
    ) {
      context.report({
        node,
        message: options?.message
          ? customMessage(options.message, description)
          : `Dependency is private of element ${elementMessage(to.parents[0])}`,
      });
    }
  },
);

const noUnknown = dependencyRule(
  { docs: { description: 'Prevent importing unknown elements from the known ones' }, schema: false },
  ({ context, description, node }) => {
    const { to } = description;
    if (to.origin === 'local' && !to.isIgnored && to.isUnknown) {
      context.report({ node, message: 'Importing unknown elements is not allowed' });
    }
  },
);

const noUnknownFiles = {
  meta: {
    type: 'problem',
    docs: { description: 'Prevent creating files not recognized as any of the element types' },
    schema: false,
  },
  create(context) {
    const settings = getSettings(context);
    const file = getMatcher(settings).describeElement(context.filename ?? context.getFilename());
    if (file.isIgnored || !file.isUnknown) return {};
    return {
      Program(node) {
        context.report({ node, message: 'File is not of any known element type' });
      },
    };
  },
};

module.exports = {
  meta: { name: 'boundaries' },
  rules: {
    'element-types': elementTypes,
    'entry-point': entryPoint,
    'no-private': noPrivate,
    'no-unknown': noUnknown,
    'no-unknown-files': noUnknownFiles,
  },
};
