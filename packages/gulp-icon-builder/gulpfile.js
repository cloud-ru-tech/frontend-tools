/* eslint-disable @typescript-eslint/no-var-requires */
const { dest, src } = require('gulp');

const {
  gulpFixSvg,
  gulpSvgUniqValidator,
  gulpSvgSizeValidator,
  gulpCreateSvgSprite,
  gulpSvgr,
  getTemplate,
  gulpSvgIndexFile,
  getTestId,
} = require('./dist/cjs');

const idPrefix = 'snack-uikit';

module.exports.default = () =>
  src('./test/icons/**/*.svg')
    .pipe(gulpSvgSizeValidator())
    .pipe(gulpSvgUniqValidator())
    .pipe(gulpFixSvg()) // FIXME: the slowest part of pipe: 12sec with and 1.2sec without
    .pipe(gulpCreateSvgSprite({ filePath: './test/dest/sprite.svg', idPrefix }))
    .pipe(gulpSvgr({ template: getTemplate({ idPrefix, generateDataTestId: getTestId }) }))
    .pipe(gulpSvgIndexFile({ src: './test/icons', dest: './test/dest' }))
    .pipe(dest('./test/dest'));
