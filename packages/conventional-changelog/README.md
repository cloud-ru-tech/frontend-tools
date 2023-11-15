# `@cloud-ru/ft-conventional-changelog`

## Note

This package is a fork of [conventional-changelog-angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular).

Our changes:
* JIRA integration (`writer-opts.js`)
* `!` breaking mark (`writer-opts.js`)

## Usage

* `semantic-release`
```javascript
export const defaultReleaseConfig = (config?: ReleaseConfig) => ({
  tagFormat: 'npm${version}',
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    [
        '@semantic-release/release-notes-generator',
        {
         config: '@cloud-ru/ft-conventional-changelog', // <--- HERE
        },
    ], ...
})
```
* `lerna`
```json5
{
  "packages": [
    "packages/*"
  ],
  "version": "independent",
  "command": {
    "publish": {
      "ignoreChanges": ["ignored-file", "*.md"],
      "message": "[ci skip] Version bump",
      "registry": "TODO://"
    },
    "version": {
      "changelogPreset": "@cloud-ru/ft-conventional-changelog", // <--- HERE
      "ignoreChanges": [
        "**/*.md",
        "**/*.MD",
        "**/*.mdx",
        "**/*.MDX",
        "./scripts/**/*"
      ]
    },
    "create": {
      "license": "Apache-2.0"
    }
  }
}
```
