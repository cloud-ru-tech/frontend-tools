import stylelint from 'stylelint';

const ruleName = 'turbopack/no-nested-media';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'Nested @media queries are not supported by Turbopack.',
});

export const noNestedMedia = stylelint.createPlugin(ruleName, () => (root, result) => {
  root.walkAtRules('media', atRule => {
    let parent = atRule.parent;
    while (parent) {
      if (parent.type === 'atrule' && parent.name === 'media') {
        stylelint.utils.report({
          message: messages.rejected,
          node: atRule,
          result,
          ruleName,
        });
        break;
      }
      parent = parent.parent;
    }
  });
});
