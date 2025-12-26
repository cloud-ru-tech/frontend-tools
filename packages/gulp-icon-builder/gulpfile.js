/* eslint-disable @typescript-eslint/no-var-requires */
const { dest, src } = require('gulp');
const { gulpFixSvg, gulpSvgUniqValidator, gulpSvgSizeValidator } = require('./dist/cjs');

module.exports.default = () =>
  src('./test/icons/*.svg')
    .pipe(gulpSvgSizeValidator())
    .pipe(gulpSvgUniqValidator())
    .pipe(gulpFixSvg())
    .pipe(dest('./test/dest'));
