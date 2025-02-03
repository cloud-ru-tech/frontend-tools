const { readFile } = require('fs/promises');
const { resolve } = require('path');

const compareFunc = require('compare-func');

const hasBreakingChanges = require('./has-breaking-changes');

function getWriterOpts() {
  return {
    transform: commit => {
      const issues = [];

      let discard = true;
      let type = commit.type;

      const notes = commit.notes.map(note => {
        discard = false;

        return {
          ...note,
          title: 'BREAKING CHANGES',
        };
      });

      if (commit.type === 'feat') {
        type = 'Features';
      } else if (commit.type === 'fix') {
        type = 'Bug Fixes';
      } else if (commit.type === 'perf') {
        type = 'Performance Improvements';
      } else if (commit.type === 'deps') {
        type = 'Dependencies';
      } else if (commit.type === 'revert' || commit.revert) {
        type = 'Reverts';
      } else if (discard) {
        return;
      } else if (commit.type === 'docs') {
        type = 'Documentation';
      } else if (commit.type === 'style') {
        type = 'Styles';
      } else if (commit.type === 'refactor') {
        type = 'Code Refactoring';
      } else if (commit.type === 'test') {
        type = 'Tests';
      } else if (commit.type === 'build') {
        type = 'Build System';
      } else if (commit.type === 'ci') {
        type = 'Continuous Integration';
      } else if (commit.type === 'story') {
        type = 'Story';
      }

      const shortHash = typeof commit.hash === 'string' ? commit.hash.substring(0, 7) : commit.shortHash;

      let scope = commit.scope === '*' ? '' : commit.scope;
      if (typeof scope === 'string') {
        // Issue URLs.
        const JIRA_ID_PATTERN = /([A-Z0-9]{2,}-[1-9][0-9]*)/g;
        scope = commit.scope.replace(JIRA_ID_PATTERN, function (_, issue) {
          issues.push(issue);
          return issue;
        });
      }

      // remove references that already appear in the subject
      const references = commit.references.filter(reference => issues.indexOf(reference.issue) === -1);

      return {
        notes,
        type,
        scope,
        shortHash,
        subject: commit.subject,
        references,
      };
    },
    finalizeContext: context =>
      /* Remove breaking changes commits
      cause "BREAKING CHANGES" section already has it */
      ({
        ...context,
        commitGroups: context.commitGroups.reduce((commitGroups, group) => {
          const commits = group.commits.filter(commit => !hasBreakingChanges(commit));
          if (commits.length) {
            commitGroups.push({
              ...group,
              commits,
            });
          }
          return commitGroups;
        }, []),
      }),
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
    noteGroupsSort: 'title',
    notesSort: compareFunc,
  };
}

module.exports = async function createWriterOpts() {
  const [template, header, commit, footer] = await Promise.all([
    readFile(resolve(__dirname, './templates/template.hbs'), 'utf-8'),
    readFile(resolve(__dirname, './templates/header.hbs'), 'utf-8'),
    readFile(resolve(__dirname, './templates/commit.hbs'), 'utf-8'),
    readFile(resolve(__dirname, './templates/footer.hbs'), 'utf-8'),
  ]);

  const writerOpts = getWriterOpts();

  writerOpts.mainTemplate = template;
  writerOpts.headerPartial = header;
  writerOpts.commitPartial = commit;
  writerOpts.footerPartial = footer;

  const changelogRepoUrl = process.env.CHANGELOG_REPO_URL;

  if (changelogRepoUrl) {
    writerOpts.repository = changelogRepoUrl;
  }

  return writerOpts;
};
