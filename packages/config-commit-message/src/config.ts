import { cosmiconfig } from 'cosmiconfig';

import { CloudRuCommitMessageConfig, defaultCloudRuCommitMessageConfig } from './defaultConfig';

export async function loadConfig(): Promise<CloudRuCommitMessageConfig> {
  const explorer = cosmiconfig('cloud-ru-commit-message');

  const config = await explorer.search();

  if (config && !config.isEmpty) {
    const result = { ...defaultCloudRuCommitMessageConfig, ...config.config };
    return result as CloudRuCommitMessageConfig;
  }

  return { ...defaultCloudRuCommitMessageConfig };
}
