type ReleaseConfig = {
  shouldPublishPackage?: boolean;
  commitAnalyzerConfig?: string;
  releaseNotesGeneratorConfig?: string;
};

export const defaultReleaseConfig = (config?: ReleaseConfig) => ({
  tagFormat: 'npm${version}',
  branches: ['master'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        config: config?.commitAnalyzerConfig || '@cloud-ru/ft-conventional-changelog',
        releaseRules: [
          {
            type: 'deps',
            release: 'patch',
          },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        config: config?.releaseNotesGeneratorConfig || '@cloud-ru/ft-conventional-changelog',
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle:
          '# Changelog\n\nAll notable changes to this project will be documented in this file. See\n[Conventional Commits](https://conventionalcommits.org) for commit guidelines.',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: Boolean(config?.shouldPublishPackage),
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/gitlab',
  ].filter(Boolean),
});
