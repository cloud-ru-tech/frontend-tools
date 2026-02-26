import camelcase from 'camelcase';
import kebabCase from 'kebab-case';

export function getTestId(componentName: string) {
  return kebabCase(componentName.replace('Svg', ''), false);
}

export function getComponentName(fileName: string) {
  return camelcase(fileName);
}
