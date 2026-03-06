import { Config, transform } from '@svgr/core';

import { getComponentName } from './utils';
import { createPipeTransformer } from './utils/createPipeTransformer';

export type GulpSvgrParams = Config;

export function gulpSvgr(params: GulpSvgrParams) {
  return createPipeTransformer({
    transformer: (file, _encoding, callback) => {
      const content = file.contents.toString();

      const componentName = getComponentName(file.basename);

      const result = transform.sync(
        content,
        {
          icon: true,
          typescript: true,
          expandProps: 'end',
          jsxRuntime: 'classic',
          exportType: 'default',
          plugins: ['@svgr/plugin-jsx'],
          ...params,
        },
        { componentName, caller: { name: 'gulp-svgr' }, filePath: file.path },
      );

      file.contents = Buffer.from(result);
      file.extname = '.tsx';

      callback(null, file);
    },
  });
}
