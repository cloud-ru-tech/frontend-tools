function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

const literal = value => ({ type: 'Literal', value });

export const ast = {
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
