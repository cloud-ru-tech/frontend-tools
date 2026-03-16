import stylelint from 'stylelint';

const ruleName = 'turbopack/no-nested-selectors';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'Nested selectors (selector { .child {} }) are not supported by Turbopack (Lightning CSS).',
});

export const noNestedSelectors = stylelint.createPlugin(ruleName, () => (root, result) => {
  root.walkRules(rule => {
    let parent = rule.parent;
    while (parent) {
      if (parent.type === 'rule') {
        stylelint.utils.report({
          message: messages.rejected,
          node: rule,
          result,
          ruleName,
        });
        break;
      }
      parent = parent.parent;
    }
  });
});
