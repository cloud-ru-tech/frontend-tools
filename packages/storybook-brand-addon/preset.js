function config(entry = []) {
  return [...entry, require.resolve('./dist/cjs/preview.js')];
}

function managerEntries(entry = []) {
  return [...entry, require.resolve('./dist/cjs/manager.js')];
}

module.exports = { managerEntries, config };
