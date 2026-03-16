import stylelint from 'stylelint';

const ruleName = 'turbopack/no-mixin-functions';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'Custom SCSS functions via sassOptions.functions are not supported in Turbopack.',
});

export const noMixinFunctions = stylelint.createPlugin(ruleName, () => (root, result) => {
  root.walkAtRules('function', atRule => {
    stylelint.utils.report({
      message: messages.rejected,
      node: atRule,
      result,
      ruleName,
    });
  });
});
