import { transform } from '@svgr/core';

import { createPipeTransformer } from './utils/createPipeTransformer';
import { template } from './utils/svgr-template';

export function gulpSvgr() {
  return createPipeTransformer((file, _encoding, callback) => {
    const content = file.contents.toString();

    const result = transform.sync(
      content,
      {
        icon: true,
        exportType: 'named',
        template,
        typescript: true,
        expandProps: 'end',
        jsxRuntime: 'classic',
        plugins: ['@svgr/plugin-jsx'],
      },
      { componentName: 'IconComponent', caller: { name: 'gulp-svgr' }, filePath: file.path },
    );

    file.contents = Buffer.from(result);
    file.extname = '.tsx';

    callback(null, file);
  });
}
