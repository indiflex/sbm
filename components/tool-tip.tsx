import { cn } from '@/lib/utils';
import type { PropsWithChildren, ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export default function ToolTip({
  content,
  variant = 'default',
  children,
}: PropsWithChildren<{
  content: ReactNode;
  variant?: 'default' | 'destructive';
}>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className={cn(variant === 'destructive' && 'bg-destructive text-white')}
        arrowClassName={cn(
          variant === 'destructive' && 'fill-destructive bg-destructive'
        )}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
