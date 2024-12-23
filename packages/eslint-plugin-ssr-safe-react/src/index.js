import { domApi } from './rules/domApi.js';

export default {
  rules: {
    domApi,
  },
  recommended: {
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
