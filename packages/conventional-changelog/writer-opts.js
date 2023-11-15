/* eslint-env node */
const compareFunc = require('compare-func');
const Q = require('q');
const readFile = Q.denodeify(require('fs').readFile);
const resolve = require('path').resolve;
const hasBreakingChanges = require('./has-breaking-changes');

function getWriterOpts() {
  return {
    transform: commit => {
      let discard = true;
      const issues = [];

      commit.notes.forEach(note => {
        note.title = 'BREAKING CHANGES';
        discard = false;
      });

      if (commit.type === 'feat') {
        commit.type = 'Features';
      } else if (commit.type === 'fix') {
        commit.type = 'Bug Fixes';
      } else if (commit.type === 'perf') {
        commit.type = 'Performance Improvements';
      } else if (commit.type === 'deps') {
        commit.type = 'Dependencies';
      } else if (commit.type === 'revert' || commit.revert) {
        commit.type = 'Reverts';
      } else if (discard) {
        return;
      } else if (commit.type === 'docs') {
        commit.type = 'Documentation';
      } else if (commit.type === 'style') {
        commit.type = 'Styles';
      } else if (commit.type === 'refactor') {
        commit.type = 'Code Refactoring';
      } else if (commit.type === 'test') {
        commit.type = 'Tests';
      } else if (commit.type === 'build') {
        commit.type = 'Build System';
      } else if (commit.type === 'ci') {
        commit.type = 'Continuous Integration';
      } else if (commit.type === 'story') {
        commit.type = 'Story';
      }

      if (commit.scope === '*') {
        commit.scope = '';
      }

      if (typeof commit.hash === 'string') {
        commit.shortHash = commit.hash.substring(0, 7);
      }

      if (typeof commit.scope === 'string') {
        // Issue URLs.
        const JIRA_ID_PATTERN = /([A-Z0-9]{2,}-[1-9][0-9]*)/g;
        commit.scope = commit.scope.replace(JIRA_ID_PATTERN, function (_, issue) {
          issues.push(issue);
          return issue;
        });
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter(reference => issues.indexOf(reference.issue) === -1);

      return commit;
    },
    finalizeContext: context => {
      /* Remove breaking changes commits
      cause "BREAKING CHANGES" section already has it */
      context.commitGroups = context.commitGroups.reduce((commitGroups, group) => {
        const commits = group.commits.filter(commit => !hasBreakingChanges(commit));
        if (commits.length) {
          commitGroups.push({
            ...group,
            commits,
          });
        }
        return commitGroups;
      }, []);

      return context;
    },
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
    notesSort: compareFunc,
  };
}

module.exports = Q.all([
  readFile(resolve(__dirname, './templates/template.hbs'), 'utf-8'),
  readFile(resolve(__dirname, './templates/header.hbs'), 'utf-8'),
  readFile(resolve(__dirname, './templates/commit.hbs'), 'utf-8'),
  readFile(resolve(__dirname, './templates/footer.hbs'), 'utf-8'),
]).spread((template, header, commit, footer) => {
  const writerOpts = getWriterOpts();

  writerOpts.mainTemplate = template;
  writerOpts.headerPartial = header;
  writerOpts.commitPartial = commit;
  writerOpts.footerPartial = footer;

  return writerOpts;
});
