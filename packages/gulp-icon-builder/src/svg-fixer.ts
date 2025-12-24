// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import svgFixer from 'oslllo-svg-fixer';

import through from 'through2';
import type File from 'vinyl';

type SvgFixer = { fixString: (svg: string | Buffer) => Promise<string> };
type TransformCallback = (err?: Error | null, data?: File) => void;

const fixSvg = (svgFixer as unknown as SvgFixer).fixString;

export function gulpFixSvg() {
  return through.obj(async (file: File, encoding: BufferEncoding, callback: TransformCallback) => {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new Error('gulpFixSvg: Streaming not supported'));
    }

    if (file.isBuffer()) {
      try {
        const fixedSvg = await fixSvg(file.contents);
        file.contents = Buffer.from(fixedSvg, encoding);
        return callback(null, file);
      } catch (error) {
        return callback(error as Error);
      }
    }

    return callback(null, file);
  });
}
