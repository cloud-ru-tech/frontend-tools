import monorepoEslintConfig from './monorepo.js';

const oxfmtEslintConfig = [
  {
    rules: {
      'prettier/prettier': 'off',
    },
  },
  {
    files: ['oxfmt.config.mts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
];

export default [...monorepoEslintConfig, ...oxfmtEslintConfig];
