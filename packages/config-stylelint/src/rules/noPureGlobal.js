import stylelint from 'stylelint';

import { RULE_NAMES } from '../const.js';

const messages = stylelint.utils.ruleMessages(RULE_NAMES.noPureGlobal, {
  rejected:
    'Top-level selector in CSS module must include at least one class (.) or id (#). Pure global selectors ([attr], a, *) are not allowed.',
});

export const noPureGlobal = stylelint.createPlugin(RULE_NAMES.noPureGlobal, () => (root, result) => {
  const filepath = root.source && root.source.input.file;
  if (!filepath || !/\.module\.(s[ac]ss|css)$/.test(filepath)) return;

  root.walkRules(rule => {
    if (rule.parent !== root) return;

    if (rule.selector && rule.selector.trim().startsWith('%')) return;

    const selectors = rule.selectors || [];
    selectors.forEach(sel => {
      if (/\.[a-zA-Z0-9_-]+/.test(sel) || /#[a-zA-Z0-9_-]+/.test(sel)) return;

      if (/^:global/.test(sel)) return;

      if (sel.trim().startsWith('%')) return;

      stylelint.utils.report({
        message: messages.rejected,
        node: rule,
        result,
        ruleName: RULE_NAMES.noPureGlobal,
      });
    });
  });
});
