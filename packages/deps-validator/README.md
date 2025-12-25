# @cloud-ru/ft-deps-validator

Validator for unused, missing or wrong version dependencies in monorepo's packages or regular repositories.

## Installation

```bash
npm i @cloud-ru/ft-deps-validator
```

## Usage

### Basic usage (via npx)

Run from the root of your repository:

```bash
npx @cloud-ru/ft-deps-validator
```

The package automatically detects if it's a monorepo or a regular repository:
- **Monorepo**: If `packages` folder exists in the current directory, it will check all packages in `packages/*`
- **Regular repository**: If `packages` folder doesn't exist, it will check the current directory as a single package

### Specify working directory

If you need to run from a different location:

```bash
npx @cloud-ru/ft-deps-validator --cwd /path/to/your/repo
# or using alias
npx @cloud-ru/ft-deps-validator -d /path/to/your/repo
```

### Custom packages folder pattern

If your packages are in a different location:

```bash
npx @cloud-ru/ft-deps-validator --rootPackagesFolderPattern "apps/*"
# or using alias
npx @cloud-ru/ft-deps-validator -p "apps/*"
```

### Configuration file

You can create a `deps-validator.config.json` file in the root of your repository to configure the validator:

```json
{
  "rootPackagesFolderPattern": "packages/*",
  "ignoredPackagesFolderFiles": ["packages/tsconfig.cjs.json"],
  "ignoreFilePatterns": ["dist", "__tests__"],
  "ignorePackagePatterns": ["react", "react-dom"],
  "packages": {
    "package-name": {
      "ignoreFilePatterns": ["build"],
      "ignorePackagePatterns": ["@some/package"]
    }
  }
}
```

> Settings in the `packages` section are merged with global settings, not overwritten. For example, if global settings have `ignoreFilePatterns: ["dist", "__tests__"]` and a specific package has `ignoreFilePatterns: ["build"]`, both lists will be used for that package: `["dist", "__tests__", "build"]`. The same applies to `ignorePackagePatterns`.

Configuration priority (highest to lowest):
1. CLI arguments
2. Configuration file
3. Default values

### Ignore specific patterns

```bash
npx @cloud-ru/ft-deps-validator --ignoreFilePatterns "stories" "dist" "__tests__"
```

### Ignore specific packages

```bash
npx @cloud-ru/ft-deps-validator --ignorePackagePatterns "react" "react-dom"
```

## Options

- `--cwd, -d` - Working directory (default: current working directory)
- `--rootPackagesFolderPattern, -p` - Folder containing packages (glob pattern, e.g., "packages/*" or "apps/*"). If not specified, automatically detects monorepo by checking for `packages` folder
- `--ignoredPackagesFolderFiles` - Specify one or more paths that should be ignored in packages folder (default: `['packages/tsconfig.cjs.json', 'packages/tsconfig.esm.json']`)
- `--ignoreFilePatterns` - Specify one or more directories names that should be ignored (default: `['stories', 'dist', '__tests__', '__e2e__']`)
- `--ignorePackagePatterns` - Specify one or more packages that should be ignored (default: includes `react`, `react-dom`, `react-docgen-typescript`, and several figma-tokens packages)
- `--help, -h` - Show help
- `--version, -v` - Show version

## What it checks

1. **Unused dependencies** - Dependencies that are declared but not used in the code
2. **Missing dependencies** - Dependencies that are used but not declared in package.json
3. **Wrong versions** (monorepo only) - Internal packages with incorrect version numbers
4. **Internal packages in devDependencies** (monorepo only) - Internal packages that should be in dependencies, not devDependencies
