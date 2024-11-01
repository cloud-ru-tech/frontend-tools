'use strict';

import { ruleTester } from '../ruleTester';

const { domApi } = require('../../src/rules/domApi');
const { DEFAULT_SCOPES, DEFAULT_CONDITIONS } = require('../../src/constants');

const DEFAULT_DOCUMENT_ERROR = {
  messageId: 'forbiddenToUse',
  data: { variableName: 'document', allowedScopes: DEFAULT_SCOPES, allowedConditions: DEFAULT_CONDITIONS },
};

ruleTester.run('domApi', domApi, {
  valid: [
    {
      name: 'usage of document inside useEffect',
      code: "function TestComponent() { useEffect(() => { document.createElement('div'); }, []); }",
    },
    {
      name: 'usage of local variable document',
      code: "function TestComponent() { const document = '1'; }",
    },
    {
      name: 'usage of local variable document initialized in the upper scope',
      code: "function TestComponent() { let document = '1'; if(true) { document = '2'; }}",
    },
    {
      name: 'usage of document inside useLayoutEffect',
      code: "function TestComponent() { useLayoutEffect(() => { document.createElement('div'); }, []); }",
    },
    {
      name: 'usage of document inside useEffect inside other hook',
      code: "function useCustom() { useLayoutEffect(() => { document.createElement('div'); }, []); }",
    },
    {
      name: 'usage of document inside several useEffects',
      code: "function TestComponent() { useEffect(() => { document.createElement('div'); }, []); useLayoutEffect(() => { document.createElement('div'); }, []); }",
    },
    {
      name: 'usage of several variables several times',
      code: "function TestComponent() { useEffect(() => { document.createElement('div'); }, []); useLayoutEffect(() => { window.document.createElement('div'); }, []); }",
    },
    {
      name: 'usage of document inside custom scope',
      code: "function TestComponent() { useCustom(() => { document.createElement('div'); }, []); }",
      options: [{ allowedScopes: ['useCustom'] }],
    },
    {
      name: 'adding a custom scope still makes document available in useEffect',
      code: "function TestComponent() { useEffect(() => { document.createElement('div'); }, []); }",
      options: [{ allowedScopes: ['useCustom'] }],
    },
    {
      name: 'usage of document inside condition',
      code: "if(isBrowser()) { document.createElement('div'); }",
    },
    {
      name: 'usage of document inside composite condition',
      code: "if(true && isBrowser()) { document.createElement('div'); }",
    },
    {
      name: 'usage of document inside ternary operator',
      code: "isBrowser() ? document.createElement('div') : undefined;",
    },
    {
      name: 'usage of document inside logical expression',
      code: 'isBrowser() && document.body',
    },
    {
      name: 'usage of document inside long logical expression',
      code: 'isBrowser() && document.body && true;',
    },
    {
      name: 'usage of variable in types',
      code: 'function TestComponent() { const observerRef = useRef<IntersectionObserver>(); }',
    },
  ],
  invalid: [
    {
      name: 'usage of document inside react component body',
      code: "function TestComponent() { document.createElement('div'); }",
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'usage of document inside other hook',
      code: "function useCustom() { document.createElement('div'); }",
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'usage of document directly',
      code: "document.createElement('div');",
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'several usage of variables',
      code: "history.createElement('div'); function TestComponent() { document.createElement('div'); }",
      errors: [
        {
          messageId: 'forbiddenToUse',
          data: { variableName: 'history', allowedScopes: DEFAULT_SCOPES, allowedConditions: DEFAULT_CONDITIONS },
        },
        DEFAULT_DOCUMENT_ERROR,
      ],
    },
    {
      name: 'usage of several variables (+ custom ones)',
      code: "abc.createElement('div'); function TestComponent() { document.createElement('div'); }",
      options: [{ restrictedVariables: ['abc'] }],
      errors: [
        {
          messageId: 'forbiddenToUse',
          data: { variableName: 'abc', allowedScopes: DEFAULT_SCOPES, allowedConditions: DEFAULT_CONDITIONS },
        },
        DEFAULT_DOCUMENT_ERROR,
      ],
    },
    {
      name: 'adding a custom variables still makes document restricted',
      code: "function TestComponent() { document.createElement('div'); }",
      options: [{ restrictedVariables: ['abc'] }],
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'usage of document inside condition',
      code: "if(!isBrowser()) { document.createElement('div'); }",
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'usage of document inside else condition',
      code: "if(isBrowser()) { undefined; } else { document.createElement('div'); }",
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'usage of document inside ternary operator',
      code: "isBrowser() ? undefined : document.createElement('div');",
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'usage of document inside logical expression in the beginning',
      code: 'document.body && isBrowser();',
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'usage of document inside logical expression in the middle',
      code: 'true && document.body && isBrowser();',
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
    {
      name: 'usage of document inside logical expression in the end',
      code: 'true && f() && document.body',
      errors: [DEFAULT_DOCUMENT_ERROR],
    },
  ],
});
