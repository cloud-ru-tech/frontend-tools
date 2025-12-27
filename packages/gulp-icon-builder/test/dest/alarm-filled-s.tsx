// DO NOT EDIT IT MANUALLY

import type { SVGProps } from 'react';
import * as React from 'react';

export type ISvgIconProps = {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
} & SVGProps<SVGSVGElement>;
const IconComponent = React.forwardRef(({ size = 24, ...props }: ISvgIconProps, ref: React.Ref<SVGSVGElement>) => {
  props.width = undefined;
  props.height = undefined;
  const testId = 'snack-uikit-IconComponent';
  const isCustomSize = typeof size === 'number';
  if (isCustomSize) {
    if (!props.style) props.style = {};
    props.style.width = size + 'px';
    props.style.height = size + 'px';
  }
  return (
    <svg
      ref={ref}
      xmlns='http://www.w3.org/2000/svg'
      width='1em'
      height='1em'
      fill='currentColor'
      viewBox='0 0 24 24'
      data-test-id={'icon' + testId}
      {...props}
    >
      <use href={'#snack-uikit-' + testId.substring(1)} />
    </svg>
  );
});
export { IconComponent as ReactComponent };
