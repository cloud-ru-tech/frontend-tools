import fs from 'fs';
import path from 'path';

import globConfig from '../../package.json';
import globTSConfigCJS from '../../packages/tsconfig.cjs.json';
import globTSConfigESM from '../../packages/tsconfig.esm.json';

const PackagesRootFolder = 'packages';

const Folders = {
  root: '/',
  src: '/src',
};

export const createFolderStructure = ({ packageName }: { packageName: string }) => {
  for (const folder in Folders) {
    fs.mkdirSync(`./${PackagesRootFolder}/${packageName}/${Folders[folder]}`);
  }
};

export const packageJson = ({
  user,
  email,
  packageName,
  packageDescription,
  packageKeywords,
}: {
  user: string;
  email: string;
  packageName: string;
  packageDescription: string;
  packageKeywords: string[];
}) => {
  const config = {
    name: `${globConfig.name}-${packageName}`,
    version: '0.0.0',
    description: `${packageDescription}`,
    keywords: packageKeywords,
    author: `${user} <${email}>`,
    license: 'Apache-2.0',
    types: './dist/esm/index.d.ts',
    exports: {
      import: './dist/esm/index.js',
      require: './dist/cjs/index.js',
    },
    files: ['dist/esm', 'dist/cjs', 'src', './CHANGELOG.md', 'LICENSE'],
    homepage: `${globConfig.homepage}packages/${packageName}`,
    repository: {
      type: 'git',
      url: globConfig.repository.url,
      directory: `packages/${packageName}`,
    },
  };

  const packageJsonFile = path.join(`./${PackagesRootFolder}/${packageName}/package.json`);

  fs.writeFileSync(packageJsonFile, JSON.stringify(config, null, 2));
};

export const changelog = ({ packageName }: { packageName: string }) => {
  // Whitespace in this const is intentional, since it defines how the markdown is shown
  const changelogContent = `## CHANGELOG

### v0.0.0

- Initial version
`;

  const file = path.join(`./${PackagesRootFolder}/${packageName}/CHANGELOG.md`);

  fs.writeFileSync(file, changelogContent);
};

export const readme = ({ packageName }: { packageName: string }) => {
  // Whitespace in this const is intentional, since it defines how the markdown is shown
  const readmeContent = `# ${globConfig.name}-${packageName}

## Installation
\`npm i ${globConfig.name}-${packageName}\`
`;

  const readmeFile = path.join(`./${PackagesRootFolder}/${packageName}/README.md`);

  fs.writeFileSync(readmeFile, readmeContent);
};

export const license = ({ packageName }: { packageName: string }) => {
  const src = path.join('./LICENSE');
  const dist = path.join(`./${PackagesRootFolder}/${packageName}/LICENSE`);

  fs.copyFileSync(src, dist);
};

export const tsConfigCjs = ({ packageName }: { packageName: string }) => {
  const fileContent = `{
  "extends": "../tsconfig.cjs.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist/cjs"
  },
  "include": ["./src"],
  "exclude": ["./dist"]
}
`;
  fs.writeFileSync(path.join(`./${PackagesRootFolder}/${packageName}/tsconfig.cjs.json`), fileContent);
};
export const tsConfigEsm = ({ packageName }: { packageName: string }) => {
  const fileContent = `{
  "extends": "../tsconfig.esm.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist/esm"
  },
  "include": ["./src"],
  "exclude": ["./dist"]
}
`;

  fs.writeFileSync(path.join(`./${PackagesRootFolder}/${packageName}/tsconfig.esm.json`), fileContent);
};

export const packageEntry = ({ packageName }: { packageName: string }) => {
  const indexFilePath = path.join(`./${PackagesRootFolder}/${packageName}/${Folders.src}/index.ts`);

  fs.writeFileSync(indexFilePath, '');
};

export const globalTsConfigs = ({ packageName }: { packageName: string }) => {
  const packagePath = `./${packageName}`;

  if (!globTSConfigESM.references.find(({ path }) => path === packagePath)) {
    globTSConfigESM.references.push({ path: `${packagePath}/tsconfig.esm.json` });
    fs.writeFileSync(`./${PackagesRootFolder}/tsconfig.esm.json`, JSON.stringify(globTSConfigESM, null, 2));
  }

  if (!globTSConfigCJS.references.find(({ path }) => path === packagePath)) {
    globTSConfigCJS.references.push({ path: `${packagePath}/tsconfig.cjs.json` });
    fs.writeFileSync(`./${PackagesRootFolder}/tsconfig.cjs.json`, JSON.stringify(globTSConfigCJS, null, 2));
  }
};
