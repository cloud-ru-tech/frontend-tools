const defaultBabelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead, node 16',
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true,
        regenerator: true,
      },
    ],
  ],
};

if (process.env.IS_DEV_MODE) {
  defaultBabelConfig.plugins.push(['react-refresh/babel']);
}

export { defaultBabelConfig };
