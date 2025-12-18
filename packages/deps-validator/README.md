# @cloud-ru/ft-deps-validator

Validator for unused, missing or wrong version dependencies in monorepo's packages.

## Installation

```bash
npm i @cloud-ru/ft-deps-validator
```

## Usage

### Basic usage (via npx)

Run from the root of your monorepo:

```bash
npx @cloud-ru/ft-deps-validator
```

This will check all packages in the `packages/*` directory relative to the current working directory.

### Specify working directory

If you need to run from a different location:

```bash
npx @cloud-ru/ft-deps-validator --cwd /path/to/your/monorepo
# or using alias
npx @cloud-ru/ft-deps-validator -d /path/to/your/monorepo
```

### Custom packages folder pattern

If your packages are in a different location:

```bash
npx @cloud-ru/ft-deps-validator --rootPackagesFolderPattern "apps/*"
# or using alias
npx @cloud-ru/ft-deps-validator -p "apps/*"
```

### Combined options

```bash
npx @cloud-ru/ft-deps-validator --cwd /path/to/monorepo --rootPackagesFolderPattern "packages/*"
```

### Ignore specific patterns

```bash
npx @cloud-ru/ft-deps-validator --ignorePatterns "stories" "dist" "__tests__"
```

### Ignore specific packages

```bash
npx @cloud-ru/ft-deps-validator --ignoreMatches "react" "react-dom"
```

## Options

- `--cwd, -d` - Working directory (default: current working directory)
- `--rootPackagesFolderPattern, -p` - Folder containing packages (glob pattern, e.g., "packages/*" or "apps/*")
- `--prefix` - Specify monorepo prefix (if skipped will try to find automatically)
- `--ignoredPackagesFolderFiles` - Specify one or more paths that should be ignored in packages folder
- `--ignorePatterns` - Specify one or more directories names that should be ignored (default: `['stories', 'dist', '__tests__', '__e2e__']`)
- `--ignoreMatches` - Specify one or more packages that should be ignored
- `--help, -h` - Show help
- `--version, -v` - Show version

## What it checks

1. **Unused dependencies** - Dependencies that are declared but not used in the code
2. **Missing dependencies** - Dependencies that are used but not declared in package.json
3. **Wrong versions** - Internal packages with incorrect version numbers
4. **Internal packages in devDependencies** - Internal packages that should be in dependencies, not devDependencies
