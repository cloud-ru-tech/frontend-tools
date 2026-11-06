'use strict';

const path = require('path');

function jsPlugin(name, request) {
  return { name, specifier: require.resolve(request) };
}

function localJsPlugin(name, relativePath) {
  return { name, specifier: path.join(__dirname, '..', relativePath) };
}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function uniqueBy(items, key) {
  const map = new Map();
  for (const item of items) map.set(key(item), item);
  return [...map.values()];
}

function mergeOxlintConfigs(...configs) {
  return configs.filter(Boolean).reduce((acc, config) => {
    const next = { ...acc };
    for (const [key, value] of Object.entries(config)) {
      if (value === undefined) continue;
      switch (key) {
        case 'rules':
        case 'env':
        case 'globals':
        case 'categories':
        case 'options':
          next[key] = { ...(acc[key] || {}), ...value };
          break;
        case 'settings': {
          const settings = { ...(acc.settings || {}) };
          for (const [settingKey, settingValue] of Object.entries(value)) {
            settings[settingKey] =
              isObject(settingValue) && isObject(settings[settingKey])
                ? { ...settings[settingKey], ...settingValue }
                : settingValue;
          }
          next.settings = settings;
          break;
        }
        case 'plugins':
        case 'ignorePatterns':
          next[key] = [...new Set([...(acc[key] || []), ...value])];
          break;
        case 'jsPlugins':
          next.jsPlugins = uniqueBy([...(acc.jsPlugins || []), ...value], plugin =>
            typeof plugin === 'string' ? plugin : plugin.name,
          );
          break;
        case 'overrides':
          next.overrides = [...(acc.overrides || []), ...value];
          break;
        default:
          next[key] = value;
      }
    }
    return next;
  }, {});
}

module.exports = { jsPlugin, localJsPlugin, mergeOxlintConfigs };
