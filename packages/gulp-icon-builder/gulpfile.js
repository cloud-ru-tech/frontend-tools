/* eslint-disable @typescript-eslint/no-var-requires */
const { dest, src } = require('gulp');
const {
  gulpFixSvg,
  gulpSvgUniqValidator,
  gulpSvgSizeValidator,
  gulpCreateSvgSprite,
  gulpSvgr,
  template,
  gulpSvgIndexFile,
} = require('./dist/cjs');

module.exports.default = () =>
  src('./test/icons/**/*.svg')
    .pipe(gulpSvgSizeValidator())
    .pipe(gulpSvgUniqValidator())
    .pipe(gulpFixSvg()) // FIXME: the slowest part of pipe: 12sec with and 1.2sec without
    .pipe(gulpCreateSvgSprite({ filePath: './test/dest/sprite.svg', prefix: 'snack-icons-' }))
    .pipe(gulpSvgr({ template }))
    .pipe(gulpSvgIndexFile({ src: './test/icons', dest: './test/dest' }))
    .pipe(dest('./test/dest'));
