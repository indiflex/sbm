"use client";

import { cn } from "@/lib/utils";
import type { JSX, MouseEvent, PropsWithChildren } from "react";
import IconLabel from "./icon-label";
import ToolTip from "./tool-tip";
import { Button } from "./ui/button";

type Props = {
  icon: JSX.Element;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
  isDanger?: boolean;
  tooltip?: string;
  disabled?: boolean;
  noti?: "default" | "muted" | "primary" | "destructive" | "success";
};

export default function IconLabelButton({
  icon,
  onClick,
  isActive,
  isDanger,
  tooltip,
  disabled,
  noti,
  children,
}: PropsWithChildren<Props>) {
  return (
    <ToolTip content={tooltip} disabled={!tooltip} variant={isDanger ? "destructive" : "default"}>
      <Button
        onClick={onClick}
        variant={"ghost"}
        className={cn(
          "h-[80%] py-1 dark:hover:bg-muted-foreground/30",
          isDanger && "text-destructive",
          { "px-2": !children || children !== 0 },
        )}
        disabled={disabled}
      >
        <IconLabel icon={icon} isActive={isActive} isDanger={isDanger} noti={noti}>
          {children}
        </IconLabel>
      </Button>
    </ToolTip>
  );
}
