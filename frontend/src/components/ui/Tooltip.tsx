import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = 'top',
  delayDuration = 200,
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          className="
            z-50 px-3 py-1.5 text-sm
            bg-neutral-900 dark:bg-neutral-100
            text-white dark:text-neutral-900
            rounded-md shadow-lg
            animate-in fade-in-0 zoom-in-95
          "
          sideOffset={5}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};
