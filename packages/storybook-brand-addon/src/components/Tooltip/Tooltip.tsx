import {
  FloatingPortal,
  offset,
  Placement,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { StorybookTheme, useTheme } from 'storybook/theming';
import { MouseEvent, ReactNode } from 'react';

type TooltipProps = {
  open: boolean;
  setOpen(value: boolean): void;
  children: ReactNode;
  tooltip: ReactNode;
  placement?: Placement;
  onReferenceClick?(e: MouseEvent<HTMLDivElement>): void;
  onFloatingClick?(e: MouseEvent<HTMLDivElement>): void;
};

export function Tooltip({
  tooltip,
  children,
  open,
  setOpen,
  placement = 'bottom',
  onReferenceClick,
  onFloatingClick,
}: TooltipProps) {
  const { background } = useTheme() as StorybookTheme;
  const { context, refs, strategy, x, y } = useFloating({
    open,
    onOpenChange: setOpen,
    strategy: 'fixed',
    placement,
    middleware: [offset({ mainAxis: 4 })],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context)]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps({ onClick: onReferenceClick })}>
        {children}
      </div>
      {open && (
        <FloatingPortal root={document.body}>
          <div
            className={'addon-tooltip'}
            {...getFloatingProps({ onClick: onFloatingClick })}
            ref={refs.setFloating}
            style={{ position: strategy, left: x ?? 0, top: y ?? 0, background: background.app }}
          >
            {tooltip}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
