import stylelint from 'stylelint';

const ruleName = 'turbopack/no-sass-tilda-import';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'The "~" in @import (Webpack legacy Sass import) is not supported by Turbopack. Use direct module import.',
});

export const noSassTildaImport = stylelint.createPlugin(ruleName, () => (root, result) => {
  root.walkAtRules('import', atRule => {
    if (atRule.params && /^['"]~[^'"]+['"]/.test(atRule.params.trim())) {
      stylelint.utils.report({
        message: messages.rejected,
        node: atRule,
        result,
        ruleName,
      });
    }
  });
});
