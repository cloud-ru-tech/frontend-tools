import type { Template } from '@svgr/babel-plugin-transform-svg-component';
import { transform } from '@svgr/core';

import { getComponentName } from './utils';
import { createPipeTransformer } from './utils/createPipeTransformer';

export type GulpSvgrParams = {
  template: Template;
};

export function gulpSvgr({ template }: GulpSvgrParams) {
  return createPipeTransformer({
    transformer: (file, _encoding, callback) => {
      const content = file.contents.toString();

      const componentName = getComponentName(file.basename);

      const result = transform.sync(
        content,
        {
          icon: true,
          template,
          typescript: true,
          expandProps: 'end',
          jsxRuntime: 'classic',
          exportType: 'default',
          plugins: ['@svgr/plugin-jsx'],
        },
        { componentName, caller: { name: 'gulp-svgr' }, filePath: file.path },
      );

      file.contents = Buffer.from(result);
      file.extname = '.tsx';

      callback(null, file);
    },
  });
}
