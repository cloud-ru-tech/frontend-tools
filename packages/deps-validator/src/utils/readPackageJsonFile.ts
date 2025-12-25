import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

type PackageJson = {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

export const readPackageJsonFile = async (folder: string): Promise<PackageJson> => {
  const file = await fsp.readFile(path.resolve(folder, './package.json'), 'utf8');
  return JSON.parse(file);
};

export const readPackageJsonFileSync = (folder: string): PackageJson => {
  const file = fs.readFileSync(path.resolve(folder, './package.json'), 'utf8');
  return JSON.parse(file);
};
