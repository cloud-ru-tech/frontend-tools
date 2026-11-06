'use strict';

const isStaticString = node =>
  (node.type === 'Literal' && typeof node.value === 'string') ||
  (node.type === 'TemplateLiteral' && node.expressions.length === 0);

const noDynamicRequire = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Forbid `require()` calls with expressions' },
    schema: false,
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments.length > 0 &&
          !isStaticString(node.arguments[0])
        ) {
          context.report({ node, message: 'Calls to require() should use string literals' });
        }
      },
    };
  },
};

module.exports = {
  meta: { name: 'import-js' },
  rules: { 'no-dynamic-require': noDynamicRequire },
};
