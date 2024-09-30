const whatBump = require('./conventional-recommended-bump');
const createParserOpts = require('./parser-opts');
const createWriterOpts = require('./writer-opts');

module.exports = async function createPreset() {
  return {
    parser: createParserOpts(),
    writer: await createWriterOpts(),
    whatBump,
  };
};
