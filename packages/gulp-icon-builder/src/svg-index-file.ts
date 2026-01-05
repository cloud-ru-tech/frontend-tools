import fs from 'node:fs';
import path from 'node:path';

import { createPipeTransformer } from './utils/createPipeTransformer';
import { getComponent } from './utils/index-template';

type Params = {
  src: string;
  dest: string;
};

export function gulpSvgIndexFile({ src, dest }: Params) {
  const folders: Record<string, string[]> = {};

  const getTail = (fullPath: string) => fullPath.replace(`${path.resolve(process.cwd(), src)}/`, '');

  return createPipeTransformer({
    transformer: (file, _encoding, callback) => {
      const folder = file.dirname;
      const files = folders[folder] || [];
      files.push(file.basename);
      folders[folder] = files;

      callback(null, file);
    },

    onEnd: async () => {
      for (const [folder, files] of Object.entries(folders)) {
        if (files.length !== 1 && files.length !== 2) {
          throw new Error(`Unexpected count of files in folder: ${folder}`);
        }

        const component =
          files.length === 2 ? getComponent(files, 'Component') : `export * from './${files[0].split('.')[0]}';`;

        const finalFilePath = path.resolve(dest, getTail(folder), 'index.tsx');

        fs.writeFileSync(finalFilePath, component);
      }
    },
  });
}
