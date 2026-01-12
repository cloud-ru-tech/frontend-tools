import fs from 'node:fs';
import path from 'node:path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SVGSprite from 'svg-sprite';

import { createPipeTransformer } from './utils/createPipeTransformer';

export function gulpCreateSvgSprite({ filePath, idPrefix }: { idPrefix: string; filePath: string }) {
  const sprite = new SVGSprite({
    dest: path.resolve(process.cwd(), filePath),
    mode: {
      symbol: true,
    },
  });

  return createPipeTransformer({
    transformer: (file, _encoding, callback) => {
      const content = file.contents.toString();

      const name = (idPrefix + '-' + path.basename(file.path)).split('.')[0];

      sprite.add(name, null, content.replace(/fill="[A-Za-z0-9#]+"/g, 'fill="inherit"'));

      callback(null, file);
    },

    onEnd: async () => {
      const { result } = await sprite.compileAsync();
      fs.writeFileSync(path.resolve(process.cwd(), filePath), result.symbol.sprite.contents.toString());
    },
  });
}
