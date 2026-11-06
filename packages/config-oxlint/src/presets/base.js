'use strict';

const { builtinModules } = require('module');

const { jsPlugin, localJsPlugin } = require('./utils');

const nodeBuiltinModules = builtinModules.join('|');
const ourOwnModules = ['@cloud', '@snack-ui'].join('|');

const importSortGroups = [
  [`^\\u0000@?\\w`],
  [`^\\u0000(${ourOwnModules})`],
  ['^\\u0000#\\w'],
  ['^\\u0000\\.'],
  [`^(${nodeBuiltinModules})`],
  [`^@?\\w`],
  [`^(${ourOwnModules})`],
  ['^#\\w'],
  ['^\\.'],
];

const eslintRecommendedRules = {
  'constructor-super': 'error',
  'for-direction': 'error',
  'getter-return': 'error',
  'no-async-promise-executor': 'error',
  'no-case-declarations': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': 'error',
  'no-const-assign': 'error',
  'no-constant-binary-expression': 'error',
  'no-constant-condition': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-dupe-class-members': 'error',
  'no-dupe-else-if': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-case': 'error',
  'no-empty': 'error',
  'no-empty-character-class': 'error',
  'no-empty-pattern': 'error',
  'no-empty-static-block': 'error',
  'no-ex-assign': 'error',
  'no-extra-boolean-cast': 'error',
  'no-fallthrough': 'error',
  'no-func-assign': 'error',
  'no-global-assign': 'error',
  'no-import-assign': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-loss-of-precision': 'error',
  'no-misleading-character-class': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-nonoctal-decimal-escape': 'error',
  'no-obj-calls': 'error',
  'no-redeclare': 'error',
  'no-regex-spaces': 'error',
  'no-self-assign': 'error',
  'no-setter-return': 'error',
  'no-shadow-restricted-names': ['error', { reportGlobalThis: false }],
  'no-sparse-arrays': 'error',
  'no-this-before-super': 'error',
  'no-unreachable': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  'no-unsafe-optional-chaining': 'error',
  'no-unused-labels': 'error',
  'no-unused-private-class-members': 'error',
  'no-useless-backreference': 'error',
  'no-useless-catch': 'error',
  'no-useless-escape': 'error',
  'no-with': 'error',
  'require-yield': 'error',
  'use-isnan': 'error',
  'valid-typeof': 'error',
};

const typescriptRecommendedRules = {
  'typescript/ban-ts-comment': 'error',
  'no-array-constructor': 'error',
  'typescript/no-duplicate-enum-values': 'error',
  'typescript/no-empty-object-type': 'error',
  'typescript/no-explicit-any': 'error',
  'typescript/no-extra-non-null-assertion': 'error',
  'typescript/no-misused-new': 'error',
  'typescript/no-namespace': 'error',
  'typescript/no-non-null-asserted-optional-chain': 'error',
  'typescript/no-this-alias': 'error',
  'typescript/no-unnecessary-type-constraint': 'error',
  'typescript/no-unsafe-declaration-merging': 'error',
  'typescript/no-unsafe-function-type': 'error',
  'no-unused-expressions': 'error',
  'typescript/no-wrapper-object-types': 'error',
  'typescript/prefer-as-const': 'error',
  'typescript/prefer-namespace-keyword': 'error',
  'typescript/triple-slash-reference': 'error',
};

const reactRecommendedRules = {
  'react/jsx-key': 'error',
  'react/jsx-no-comment-textnodes': 'error',
  'react/jsx-no-duplicate-props': 'error',
  'react/jsx-no-target-blank': 'error',
  'react/jsx-no-undef': 'error',
  'react/no-children-prop': 'error',
  'react/no-danger-with-children': 'error',
  'react/no-direct-mutation-state': 'error',
  'react/no-find-dom-node': 'error',
  'react/no-is-mounted': 'error',
  'react/no-render-return-value': 'error',
  'react/no-string-refs': 'error',
  'react/no-unescaped-entities': 'error',
  'react/no-unknown-property': 'error',
  'react/require-render-return': 'error',
};

const vitestRecommendedRules = {
  'vitest/expect-expect': 'error',
  'vitest/no-commented-out-tests': 'error',
  'vitest/no-conditional-expect': 'error',
  'vitest/no-disabled-tests': 'warn',
  'vitest/no-focused-tests': 'error',
  'vitest/no-identical-title': 'error',
  'vitest/no-import-node-test': 'error',
  'vitest/no-interpolation-in-snapshots': 'error',
  'vitest/no-mocks-import': 'error',
  'vitest/no-standalone-expect': 'error',
  'vitest/no-unneeded-async-expect-function': 'error',
  'vitest/prefer-called-exactly-once-with': 'error',
  'vitest/require-local-test-context-for-concurrent-snapshots': 'error',
  'vitest/valid-describe-callback': 'error',
  'vitest/valid-expect': 'error',
  'vitest/valid-expect-in-promise': 'error',
  'vitest/valid-title': 'error',
};

const jsxA11yRecommendedRules = {
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/anchor-has-content': 'error',
  'jsx-a11y/anchor-is-valid': 'error',
  'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/aria-proptypes': 'error',
  'jsx-a11y/aria-role': 'error',
  'jsx-a11y/aria-unsupported-elements': 'error',
  'jsx-a11y/autocomplete-valid': 'error',
  'jsx-a11y/heading-has-content': 'error',
  'jsx-a11y/html-has-lang': 'error',
  'jsx-a11y/iframe-has-title': 'error',
  'jsx-a11y/img-redundant-alt': 'error',
  'jsx-a11y/interactive-supports-focus': [
    'error',
    { tabbable: ['button', 'checkbox', 'link', 'searchbox', 'spinbutton', 'switch', 'textbox'] },
  ],
  'jsx-a11y/label-has-associated-control': 'error',
  'jsx-a11y/media-has-caption': 'error',
  'jsx-a11y/mouse-events-have-key-events': 'error',
  'jsx-a11y/no-access-key': 'error',
  'jsx-a11y/no-distracting-elements': 'error',
  'jsx-a11y/no-interactive-element-to-noninteractive-role': [
    'error',
    { tr: ['none', 'presentation'], canvas: ['img'] },
  ],
  'jsx-a11y/no-noninteractive-element-interactions': [
    'error',
    {
      handlers: ['onClick', 'onError', 'onLoad', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
      alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
      body: ['onError', 'onLoad'],
      dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
      iframe: ['onError', 'onLoad'],
      img: ['onError', 'onLoad'],
    },
  ],
  'jsx-a11y/no-noninteractive-element-to-interactive-role': [
    'error',
    {
      ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
      ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
      li: ['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'tab', 'treeitem'],
      table: ['grid'],
      td: ['gridcell'],
      fieldset: ['radiogroup', 'presentation'],
    },
  ],
  'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: [], roles: ['tabpanel'], allowExpressionValues: true }],
  'jsx-a11y/no-redundant-roles': 'error',
  'jsx-a11y/no-static-element-interactions': [
    'error',
    {
      allowExpressionValues: true,
      handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
    },
  ],
  'jsx-a11y/role-has-required-aria-props': 'error',
  'jsx-a11y/role-supports-aria-props': 'error',
  'jsx-a11y/scope': 'error',
  'jsx-a11y/tabindex-no-positive': 'error',
};

const noDefaultExport = { direct: true, named: true, defaultFrom: true, namedFrom: true, namespaceFrom: true };

const customRules = {
  'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
  'no-extra-bind': 'error',
  'no-implied-eval': 'error',
  'no-labels': 'error',
  'no-self-compare': 'error',
  'no-throw-literal': 'error',
  'no-void': 'error',
  'no-duplicate-imports': 'error',

  'react/rules-of-hooks': 'error',
  'react/exhaustive-deps': 'error',

  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'arrow-body-style': ['error', 'as-needed'],
  'no-restricted-exports': ['error', { restrictDefaultExports: noDefaultExport }],
  'import-js/no-dynamic-require': 'error',
  'default-case': 'error',
  'prefer-const': 'error',
  'no-else-return': 'error',
  'no-implicit-coercion': 'error',
  'no-nested-ternary': 'error',
  'no-useless-computed-key': 'error',
  'no-use-before-define': 'error',
  'no-param-reassign': ['error', { props: false }],
  // eslint-plugin-react does not check forwardRef / memo callbacks, Oxlint does
  'react/function-component-definition': [
    'error',
    { namedComponents: 'function-declaration', unnamedComponents: ['function-expression', 'arrow-function'] },
  ],
  'react/jsx-fragments': ['error', 'syntax'],
  'typescript/no-var-requires': 'error',
  'typescript/no-non-null-assertion': 'error',
  'typescript/consistent-type-definitions': ['warn', 'type'],
  'no-unused-vars': ['error', { destructuredArrayIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],

  'simple-import-sort/imports': ['warn', { groups: importSortGroups }],

  'vitest/consistent-test-it': 'error',
  'vitest/prefer-equality-matcher': 'error',
};

const configFiles = [
  '*.d.ts',
  'eslint.config.mjs',
  'oxlint.config.mts',
  'oxfmt.config.mts',
  'vitest.config.ts',
  'playwright.config.ts',
  'webpack.config.js',
  'webpack.config.ts',
];

const rules = {
  ...eslintRecommendedRules,
  ...typescriptRecommendedRules,
  ...reactRecommendedRules,
  ...jsxA11yRecommendedRules,
  ...vitestRecommendedRules,
  ...customRules,
};

const importAndCommentVitestRules = new Set([
  'vitest/no-commented-out-tests',
  'vitest/no-import-node-test',
  'vitest/no-mocks-import',
]);

function playwrightTestsOxlintOverride(files) {
  const vitestRules = Object.keys(rules).filter(
    name => name.startsWith('vitest/') && !importAndCommentVitestRules.has(name),
  );
  return { files, rules: Object.fromEntries(vitestRules.map(name => [name, 'off'])) };
}

const baseOxlintConfig = {
  plugins: ['eslint', 'typescript', 'react', 'jsx-a11y', 'vitest'],
  jsPlugins: [
    jsPlugin('simple-import-sort', 'eslint-plugin-simple-import-sort'),
    localJsPlugin('import-js', 'plugins/import-js/index.js'),
  ],
  categories: { correctness: 'off' },
  env: { builtin: true, es2020: true, browser: true, node: true, vitest: true },
  rules,
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
      rules: {
        'getter-return': 'off',
        'no-class-assign': 'off',
        'no-func-assign': 'off',
        'no-import-assign': 'off',
        'no-new-native-nonconstructor': 'off',
        'no-redeclare': 'off',
        'no-setter-return': 'off',
        'no-var': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: { 'no-unused-expressions': 'off' },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'typescript/consistent-type-definitions': 'off',
        'no-restricted-exports': 'off',
      },
    },
    {
      files: configFiles,
      rules: { 'no-restricted-exports': 'off' },
    },
    {
      files: ['*.js', '*.cjs'],
      rules: { 'typescript/no-var-requires': 'off' },
    },
    {
      files: ['tests/**/*.ts'],
      rules: { 'react/rules-of-hooks': 'off' },
    },
    playwrightTestsOxlintOverride(['tests/**/*', '**/*.e2e.ts', '**/*.e2e.js', '**/*.smoke.ts', '**/*.smoke.js']),
  ],
};

module.exports = { baseOxlintConfig, importSortGroups, configFiles, playwrightTestsOxlintOverride };
