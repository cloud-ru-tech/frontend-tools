module.exports = function createParserOpts() {
  return {
    headerPattern: /^(\w*)(?:\((.*)\))?(!?): (.*)$/,
    breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
    headerCorrespondence: ['type', 'scope', 'breakingMark', 'subject'],
    noteKeywords: ['BREAKING CHANGE'],
    revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\.?/i,
    revertCorrespondence: ['header', 'hash'],
  };
};
