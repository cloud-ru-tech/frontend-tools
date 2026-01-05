const ICON_PROPS = `
export interface ISvgIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}
`;
const REACT_IMPORT = "import { SVGProps, forwardRef, Ref } from 'react';";
const DEFAULT_SIZE = 24;

const getExportName = (fileName: string) => (fileName.endsWith('xs.tsx') ? 'XsSVG' : 'SSVG'); // TODO: переделать имена компонентов

export const getComponent = (iconFiles: string[], componentName: string) => {
  const iconImports = iconFiles
    .map(file => `import { default as ${getExportName(file)} } from './${file}';`)
    .join('\n');

  return `
  ${REACT_IMPORT}
  ${iconImports}
  
  ${ICON_PROPS}
  
  const ${componentName}SVG = forwardRef(({ size = ${DEFAULT_SIZE}, ...props }: ISvgIconProps, ref: Ref<SVGSVGElement>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Number(size) >= 20 ? <SSVG ref={ref} size={size} {...props} /> : <XsSVG ref={ref} size={size} {...props} />;
  });

  export default ${componentName}SVG;`;
};
