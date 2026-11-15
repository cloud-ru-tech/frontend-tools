# @cloud-ru/ft-solidarity

Lightweight replacement for [solidarity](https://www.npmjs.com/package/solidarity) that validates local environment against `.solidarity` config.

## Installation

```bash
npm i @cloud-ru/ft-solidarity
```

## Usage

Create `.solidarity` in the project root and run:

```bash
npx solidarity
```

Supported rules: `cli`, `shell`.

For `cli` rules, binaries from `node_modules/.bin` are ignored. Husky prepends that directory to `PATH`, so without this filter the check can pick up a transitive package binary (for example `npm` from `@semantic-release/npm`) instead of the environment tool from nvm or the Node distribution.
