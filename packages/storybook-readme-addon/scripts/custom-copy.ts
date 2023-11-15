import fs from 'fs';
import path from 'path';

const source = path.resolve(__dirname, '../src/theme/style.css');
const targetEsm = path.resolve(__dirname, '../dist/esm/theme/style.css');
const targetCjs = path.resolve(__dirname, '../dist/cjs/theme/style.css');

fs.cpSync(source, targetEsm, { force: true, recursive: true });
fs.cpSync(source, targetCjs, { force: true, recursive: true });
