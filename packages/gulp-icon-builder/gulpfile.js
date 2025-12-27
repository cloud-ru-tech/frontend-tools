/* eslint-disable @typescript-eslint/no-var-requires */
const { dest, src } = require('gulp');
const { gulpFixSvg, gulpSvgUniqValidator, gulpSvgSizeValidator, gulpCreateSvgSprite } = require('./dist/cjs');

module.exports.default = () =>
  src('./test/icons/*.svg')
    .pipe(gulpSvgSizeValidator())
    .pipe(gulpSvgUniqValidator())
    .pipe(gulpFixSvg())
    .pipe(gulpCreateSvgSprite({ filePath: './test/dest/sprite.svg', prefix: 'snack-icons-' }))
    .pipe(dest('./test/dest'));
