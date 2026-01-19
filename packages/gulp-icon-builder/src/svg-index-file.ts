import fs from 'node:fs';
import path from 'node:path';

import { createPipeTransformer } from './utils/createPipeTransformer';
import { getComponent } from './utils/index-template';

type Params = {
  src: string;
  dest: string;
  getComponentName?: (fileName: string) => string;
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const removeLeadingSlash = (str: string): string => str.replace(/^\/+/, '');

export function gulpSvgIndexFile({ src, dest, getComponentName = capitalizeFirstLetter }: Params) {
  const folders: Record<string, string[]> = {};

  const getTail = (fullPath: string) => removeLeadingSlash(fullPath.replace(path.resolve(process.cwd(), src), ''));

  return createPipeTransformer({
    transformer: (file, _encoding, callback) => {
      const folder = file.dirname;
      const files = folders[folder] || [];
      files.push(file.basename);
      folders[folder] = files;

      callback(null, file);
    },

    onEnd: async () => {
      const imports: string[] = [];
      let indexFile: string | undefined;

      for (const [folder, files] of Object.entries(folders)) {
        if (files.length !== 1 && files.length !== 2) {
          throw new Error(`Unexpected count of files in folder: ${folder}`);
        }

        {
          // index file for icon folder
          const component =
            files.length === 2
              ? getComponent(files, 'Component')
              : `export { default } from './${files[0].split('.')[0]}';`;
          const finalFilePath = path.resolve(dest, getTail(folder), 'index.tsx');
          fs.writeFileSync(finalFilePath, component);
        }

        {
          // index file for all
          const folderName = path.basename(folder);
          const componentName = getComponentName(folderName);
          imports.push(`export { default as ${componentName} } from './${folderName}';`);
          if (!indexFile) {
            indexFile = path.resolve(dest, getTail(path.dirname(folder)), 'index.tsx');
          }
        }
      }

      fs.writeFileSync(indexFile as string, imports.join('\n'));
    },
  });
}
