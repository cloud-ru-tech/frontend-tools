import type { Template } from '@svgr/babel-plugin-transform-svg-component';

const size = 24;

type getTemplateParams = {
  idPrefix: string;
  generateDataTestId: (fileName: string) => string;
};

export const getTemplate =
  ({ idPrefix, generateDataTestId }: getTemplateParams): Template =>
  ({ imports, interfaces, componentName, exports }, { tpl }) => {
    const testId = generateDataTestId(componentName);
    const componentProp = size ? `{ size = ${size}, ...props }: ISvgIconProps` : `{ size, ...props }: ISvgIconProps`;

    return tpl`
    // DO NOT EDIT IT MANUALLY
    ${imports}
    ${interfaces}

    export interface ISvgIconProps extends SVGProps<SVGSVGElement> {
      className?: string;
      size?: number;
      style?: React.CSSProperties;
    }

    const ${componentName} = React.forwardRef((${componentProp}, ref: React.Ref<SVGSVGElement>) => {
      props.width = undefined;
      props.height = undefined;

      const testId = ${JSON.stringify(testId)};
      const isCustomSize = typeof size === 'number';

      if(isCustomSize) {
        if(!props.style) props.style = {};
        props.style.width = size+"px";
        props.style.height = size+"px";
      }

      return (
        <svg
          ref={ref}
          xmlns='http://www.w3.org/2000/svg'
          width={24}
          height={24}
          fill='currentColor'
          viewBox='0 0 24 24'
          data-test-id={'icon-' + testId}
          {...props}
         >
           <use href={'#' + ${JSON.stringify(idPrefix)} + '-' + testId} />
        </svg>
      );
    });

    ${exports}
    `;
  };
