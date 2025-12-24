/* eslint-disable @typescript-eslint/no-var-requires */
const { dest, src } = require('gulp');
const { gulpFixSvg, gulpSvgValidate } = require('./dist/cjs');

module.exports.default = () =>
  src('./test/icons/*.svg').pipe(gulpSvgValidate()).pipe(gulpFixSvg()).pipe(dest('./test/dest'));
