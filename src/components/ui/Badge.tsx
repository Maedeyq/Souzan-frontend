import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-canvas px-3 text-[15px] font-semibold text-brand",
        className,
      )}
      {...props}
    />
  );
}
