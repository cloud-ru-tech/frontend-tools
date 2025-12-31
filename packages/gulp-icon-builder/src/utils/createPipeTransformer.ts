import { Transform } from 'node:stream';
import type File from 'vinyl';

type TransformCallback = (err?: Error | null, data?: File) => void;

type Transformer = (file: File.BufferFile, _encoding: BufferEncoding, callback: TransformCallback) => void;

export type PipeTransformerParams = {
  transformer: Transformer;
  onEnd?: () => void;
};

export function createPipeTransformer({ transformer, onEnd }: PipeTransformerParams) {
  const stream = new Transform({
    objectMode: true,
    async transform(file: File, _encoding: BufferEncoding, callback: TransformCallback) {
      if (file.isNull()) {
        return callback(null, file);
      }

      if (file.isStream()) {
        return callback(new Error('Streaming not supported'));
      }

      if (file.isBuffer()) {
        return transformer(file, _encoding, callback);
      }

      return callback(null, file);
    },
  });

  if (onEnd) stream.on('end', onEnd);

  return stream;
}
