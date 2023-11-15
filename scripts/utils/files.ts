import fs from 'fs';

import { logInfo } from './console';
import * as fileTemplates from './filesTemplate';

export const ExistingPackageNames = (() => fs.readdirSync('./packages/'))();

export const bootstrapFiles = ({
  packageName,
  packageDescription,
  user,
  email,
  packageKeywords,
}: {
  packageName: string;
  packageDescription: string;
  user: string;
  email: string;
  packageKeywords: string[];
}) => {
  fileTemplates.createFolderStructure({ packageName });
  logInfo('Created folder structure');

  fileTemplates.changelog({ packageName });
  logInfo('Created changelog');

  fileTemplates.readme({
    packageName,
  });
  logInfo('Created readme');

  fileTemplates.license({ packageName });
  logInfo('Created license');

  fileTemplates.tsConfigEsm({ packageName });
  logInfo('Created tsconfig.esm.json');

  fileTemplates.tsConfigCjs({ packageName });
  logInfo('Created tsconfig.cjs.json');

  fileTemplates.packageJson({
    user,
    email,
    packageKeywords,
    packageName,
    packageDescription,
  });
  logInfo('Created package.json');

  fileTemplates.packageEntry({
    packageName,
  });
  logInfo('Created package entry');

  fileTemplates.globalTsConfigs({ packageName });
  logInfo('Update global tsconfigs');
};
