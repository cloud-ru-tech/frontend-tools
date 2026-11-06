import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function createProject(files) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'config-oxlint-')));
  const write = (file, content) => {
    const filePath = path.join(root, file);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    return filePath;
  };
  Object.entries(files).forEach(([file, content]) => write(file, content));
  return {
    root,
    file: relativePath => path.join(root, relativePath),
    write,
    remove: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

const literal = value => ({ type: 'Literal', value });

export const ast = {
  import: (source, { kind = 'value', names = [] } = {}) => ({
    type: 'ImportDeclaration',
    importKind: kind,
    source: literal(source),
    specifiers: names.map(name => ({ type: 'ImportSpecifier', imported: { type: 'Identifier', name } })),
  }),
  exportFrom: (source, names = []) => ({
    type: 'ExportNamedDeclaration',
    exportKind: 'value',
    source: literal(source),
    specifiers: names.map(name => ({ type: 'ExportSpecifier', exported: { type: 'Identifier', name } })),
  }),
  exportAll: source => ({ type: 'ExportAllDeclaration', exportKind: 'value', source: literal(source) }),
  dynamicImport: source => ({ type: 'ImportExpression', source: literal(source) }),
  call: (callee, args) => ({ type: 'CallExpression', callee, arguments: args }),
  identifier: name => ({ type: 'Identifier', name }),
  literal,
  template: (quasis, expressions = []) => ({
    type: 'TemplateLiteral',
    quasis: quasis.map(raw => ({ type: 'TemplateElement', value: { raw, cooked: raw } })),
    expressions,
  }),
  binary: (left, right) => ({ type: 'BinaryExpression', operator: '+', left, right }),
  member: (object, property) => ({ type: 'MemberExpression', object, property, computed: false }),
};

export function runRule(rule, { filename, settings = {}, options = [], cwd }, nodes = []) {
  const reports = [];
  const visitors = rule.create({
    filename,
    cwd,
    settings: deepFreeze(JSON.parse(JSON.stringify(settings))),
    options: deepFreeze(JSON.parse(JSON.stringify(options))),
    report: report => reports.push(report),
  });
  visitors.Program?.({ type: 'Program', body: nodes });
  nodes.forEach(node => visitors[node.type]?.(node));
  return reports;
}
