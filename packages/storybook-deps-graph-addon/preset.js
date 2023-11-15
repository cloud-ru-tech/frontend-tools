function managerEntries(entry = []) {
  return [...entry, require.resolve('./dist/cjs/register.js')];
}

module.exports = { managerEntries };
