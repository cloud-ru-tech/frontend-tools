// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import svgFixer from 'oslllo-svg-fixer';

import { createPipeTransformer } from './utils/createPipeTransformer';

type SvgFixer = { fixString: (svg: string | Buffer) => Promise<string> };

const fixSvg = (svgFixer as unknown as SvgFixer).fixString;

export function gulpFixSvg() {
  return createPipeTransformer({
    transformer: async (file, encoding, callback) => {
      const fixedSvg = await fixSvg(file.contents);
      file.contents = Buffer.from(fixedSvg, encoding);
      return callback(null, file);
    },
  });
}
