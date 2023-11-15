import fs from 'fs';
import { resolve } from 'path';

type TsconfigFile = {
  compilerOptions: {
    baseUrl: string;
    paths?: {
      [aliasName: string]: string[];
    };
  };
};

type VitestAliases = Record<string, string>;

const replaceGlobs = (path: string): string => path.replace(/(\/\*\*)*\/\*$/, '');

export function tsconfigPathsConverter(tsConfigPath: string, dirname = '.'): VitestAliases {
  const tsConfig: TsconfigFile = JSON.parse(fs.readFileSync(tsConfigPath).toString());
  const { baseUrl, paths = {} } = tsConfig.compilerOptions;
  return Object.keys(paths).reduce((aliases: VitestAliases, pathName) => {
    const alias = replaceGlobs(pathName);
    const path = replaceGlobs(paths[pathName][0]);
    aliases[alias] = resolve(dirname, baseUrl, path);
    return aliases;
  }, {});
}
