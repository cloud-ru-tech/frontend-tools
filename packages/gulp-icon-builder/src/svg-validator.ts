import through from 'through2';
import type File from 'vinyl';

export function gulpSvgValidate() {
  return through.obj(async (file: File, _encoding: BufferEncoding, callback) => {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new Error('gulpFixSvg: Streaming not supported'));
    }

    if (file.isBuffer()) {
      try {
        const content = file.contents.toString();

        console.info(content);

        return callback(null, file);
      } catch (error) {
        return callback(error as Error);
      }
    }

    return callback(null, file);
  });
}
