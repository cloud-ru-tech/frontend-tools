'use strict';

module.exports.rules = {
  domApi: require('./rules/domApi').domApi,
};

module.exports.configs = {
  recommended: {
    plugins: ['@cloud-ru/ssr-safe-react'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          name: 'react',
          importNames: ['useLayoutEffect'],
          message:
            '`useLayoutEffect` from `react` causes a warning in SSR. You should take it from `@snack-uikit/utils`',
        },
      ],
      'no-implicit-globals': 'error',
      '@cloud-ru/ssr-safe-react/domApi': ['error'],
    },
  },
};
