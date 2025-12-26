import fs from 'fs';
import path from 'path';

import { RawMonorepoEnvType, RawRepoEnvType } from '../types';

const CONFIG_FILE_NAME = 'deps-validator.config.json';

type PossibleConfig = RawMonorepoEnvType & RawRepoEnvType;

export function getConfigFile(cwd: string): PossibleConfig {
  const configPath = path.resolve(cwd, CONFIG_FILE_NAME);

  if (!fs.existsSync(configPath)) {
    return { packages: {} };
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configContent) as PossibleConfig;
}
