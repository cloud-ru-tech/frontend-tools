export const defaultLintStagedConfig = {
  '*.{ts,js,tsx,jsx}': ['eslint --fix', 'prettier --write'],
  '*.scss': ['stylelint --fix'],
};
