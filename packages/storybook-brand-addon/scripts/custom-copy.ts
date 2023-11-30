import fs from 'fs';
import path from 'path';

const source = path.resolve(__dirname, '../src/styles.css');
const targetEsm = path.resolve(__dirname, '../dist/esm/styles.css');
const targetCjs = path.resolve(__dirname, '../dist/cjs/styles.css');

fs.cpSync(source, targetEsm, { force: true, recursive: true });
fs.cpSync(source, targetCjs, { force: true, recursive: true });
