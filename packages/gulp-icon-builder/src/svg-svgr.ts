import type { Template } from '@svgr/babel-plugin-transform-svg-component';
import { transform } from '@svgr/core';

import { createPipeTransformer } from './utils/createPipeTransformer';

export type GulpSvgrParams = {
  template: Template;
};

export function gulpSvgr({ template }: GulpSvgrParams) {
  return createPipeTransformer({
    transformer: (file, _encoding, callback) => {
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
        // TODO: componentName should be dynamic
        { componentName: 'IconComponent', caller: { name: 'gulp-svgr' }, filePath: file.path },
      );

      file.contents = Buffer.from(result);
      file.extname = '.tsx';

      callback(null, file);
    },
  });
}
