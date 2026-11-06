import { describe, expect, it } from 'vitest';

import importJs from '../src/plugins/import-js/index.js';
import { ast, runRule } from './helpers.js';

const { call, identifier, literal, template, binary, member } = ast;
const requireCall = (...args) => call(identifier('require'), args);

const check = node =>
  runRule(importJs.rules['no-dynamic-require'], { filename: 'index.js' }, [node]).map(({ message }) => message);

describe('import-js/no-dynamic-require', () => {
  it.each([
    ["require('lodash')", requireCall(literal('lodash'))],
    ['require(`lodash`)', requireCall(template(['lodash']))],
    ['require()', requireCall()],
    ['load(name)', call(identifier('load'), [identifier('name')])],
    ['module.require(name)', call(member(identifier('module'), identifier('require')), [identifier('name')])],
  ])('allows %s', (_, node) => {
    expect(check(node)).toEqual([]);
  });

  it.each([
    ['require(name)', requireCall(identifier('name'))],
    ['require(`./${name}`)', requireCall(template(['./', ''], [identifier('name')]))],
    ["require('./' + name)", requireCall(binary(literal('./'), identifier('name')))],
    ['require(getPath())', requireCall(call(identifier('getPath'), []))],
    ['require(42)', requireCall(literal(42))],
  ])('reports %s', (_, node) => {
    expect(check(node)).toEqual(['Calls to require() should use string literals']);
  });
});
