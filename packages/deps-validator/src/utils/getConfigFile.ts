import fs from 'fs';
import path from 'path';

import { CliArguments } from '../types/cliArguments';
import { Config } from '../types/config';

const CONFIG_FILE_NAME = 'deps-validator.config.json';

export function getConfigFile(cwd: CliArguments['cwd']): Config | null {
  const configPath = path.resolve(cwd, CONFIG_FILE_NAME);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent) as Config;
    return config;
  } catch {
    return null;
  }
}
