'use strict';

const { DEFAULT_SCOPES, DEFAULT_VARIABLES, DEFAULT_CONDITIONS } = require('../constants');

module.exports.domApi = {
  meta: {
    type: 'problem',
    docs: {
      description: 'restrict certain variables to only be used inside certain scopes/conditions',
      category: 'Best Practices',
    },
    messages: {
      forbiddenToUse:
        "Use global variable '{{variableName}}' only in the allowed scopes ({{allowedScopes}}) or conditions ({{allowedConditions}})",
    },
    schema: [
      {
        type: 'object',
        properties: {
          restrictedVariables: {
            description: 'Variables restricted from usage',
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
          allowedScopes: {
            description: 'Scopes where you can use restricted variables',
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
        },
      },
    ],
  },
  create(context) {
    const [options] = context.options;
    const restrictedVariables = [...DEFAULT_VARIABLES, ...(options?.restrictedVariables ?? [])];
    const allowedScopes = [...DEFAULT_SCOPES, ...(options?.allowedScopes ?? [])];

    let insideAllowedScopes = false; // Flag to track if we're inside the allowed scope
    const allowedScopesNodes = new Set();

    function enterFunction(node) {
      if (insideAllowedScopes) {
        allowedScopesNodes.add(node);
      }
    }

    function exitFunction(node) {
      if (insideAllowedScopes) {
        allowedScopesNodes.delete(node);
      }
    }

    function handleCallExpression(node) {
      if (allowedScopes.includes(node.callee.name) && node.arguments.length) {
        const callback = node.arguments[0];
        if (callback.type === 'FunctionExpression' || callback.type === 'ArrowFunctionExpression') {
          insideAllowedScopes = true;
          enterFunction(callback);
        }
      }
    }

    function isAllowedCondition({ node, nextNode }) {
      // Check for calls like isBrowser() in logical expressions
      if (node.type === 'CallExpression' && node.callee.name === 'isBrowser') {
        return true;
      }

      // Check for calls like if(isBrowser()) { ... } and isBrowser() ? ... : ...
      if (
        (node.type === 'ConditionalExpression' || node.type === 'IfStatement') &&
        isAllowedCondition({ node: node.test }) &&
        node.consequent === nextNode
      ) {
        return true;
      }

      // For logical expressions with restricted vars in the end
      if (node.type === 'LogicalExpression' && nextNode === node.right) {
        return node.operator === '&&' && isAllowedCondition({ node: node.left });
      }

      // For logical expressions with restricted vars in the middle
      if (node.type === 'LogicalExpression' && nextNode === node.left) {
        return node.parent.operator === '&&' && isAllowedCondition({ node: node.parent.left });
      }

      // For general logical expressions like isBrowser() && ...
      return (
        node.type === 'LogicalExpression' &&
        (isAllowedCondition({ node: node.left }) || isAllowedCondition({ node: node.right }))
      );
    }

    function isGlobalVariable(variableName, scope = context.getScope()) {
      const variable = scope.variables.find(v => v.name === variableName);

      if (variable && variable.defs.length > 0) {
        return false;
      }

      const upperScope = scope.upper;

      if (!upperScope) {
        return true;
      }

      return isGlobalVariable(variableName, upperScope);
    }

    return {
      CallExpression: handleCallExpression,
      'CallExpression:exit': node => {
        if (allowedScopes.includes(node.callee.name)) {
          insideAllowedScopes = false;
        }
      },
      FunctionExpression: enterFunction,
      FunctionDeclaration: enterFunction,
      ArrowFunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      'FunctionDeclaration:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      Identifier(node) {
        const variableName = node.name;

        if (restrictedVariables.includes(variableName)) {
          const ancestors = context.getAncestors();
          const isInsideAllowedCondition = ancestors.some((ancestor, index) =>
            isAllowedCondition({ node: ancestor, nextNode: ancestors[index + 1] }),
          );

          if (!isInsideAllowedCondition && !insideAllowedScopes && isGlobalVariable(variableName)) {
            context.report({
              node,
              messageId: 'forbiddenToUse',
              data: { variableName, allowedScopes, allowedConditions: DEFAULT_CONDITIONS },
            });
          }
        }
      },
    };
  },
};
