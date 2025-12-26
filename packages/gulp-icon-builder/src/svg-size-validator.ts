import { XMLParser } from 'fast-xml-parser';

import { createPipeTransformer } from './utils/createPipeTransformer';

export function gulpSvgSizeValidator(maxSize: number = 24) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  return createPipeTransformer((file, _encoding, callback) => {
    const content = file.contents.toString();
    /*
      А че, если мы не будем здесь стопать парсингом xml пайп, а вместо этого отложим парсинг и проверку в асинхронный пул?
      А дожидаться разгребания этого пула будем в колбеке закрытия стрима, когда вся основная работа уже сделана.
    */
    const xml = parser.parse(content);

    const width = xml.svg['@_width'];
    const height = xml.svg['@_height'];

    if ((width && Number(width) > maxSize) || (height && Number(height) > maxSize)) {
      return callback(new Error(`Icon size is bigger than ${maxSize}px, please make it smaller:\n\t${file.path}\n`));
    }

    return callback(null, file);
  });
}
