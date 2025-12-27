import { Transform } from 'node:stream';
import type File from 'vinyl';

type TransformCallback = (err?: Error | null, data?: File) => void;

type Transformer = (file: File.BufferFile, _encoding: BufferEncoding, callback: TransformCallback) => void;

export function createPipeTransformer(transformer: Transformer, onEnd?: () => void) {
  const stream = new Transform({
    objectMode: true,
    async transform(file: File, _encoding: BufferEncoding, callback: TransformCallback) {
      if (file.isNull()) {
        return callback(null, file);
      }

      if (file.isStream()) {
        return callback(new Error('gulpFixSvg: Streaming not supported'));
      }

      if (file.isBuffer()) {
        try {
          return transformer(file, _encoding, callback);
        } catch (error) {
          return callback(error as Error);
        }
      }

      return callback(null, file);
    },
  });

  if (onEnd) {
    stream.on('end', onEnd);
  }

  return stream;
}
