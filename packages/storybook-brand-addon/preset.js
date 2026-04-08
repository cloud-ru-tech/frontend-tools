module.exports = {
  managerEntries: (entry = []) => [...entry, require.resolve('./dist/cjs/manager.js')],
  previewAnnotations: (entry = []) => [...entry, require.resolve('./dist/cjs/preview.js')],
};
