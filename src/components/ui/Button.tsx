import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "highlight" | "outline";
type Size = "md" | "sm";

type CommonProps = { variant?: Variant; size?: Size; className?: string };
type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className"> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentProps<"a">, "className" | "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex items-center justify-center gap-2 rounded-control border-2 font-extrabold " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "border-brand bg-brand text-white hover:bg-brand-soft hover:border-brand-soft",
  accent: "border-accent bg-accent text-white hover:bg-accent-strong hover:border-accent-strong",
  highlight: "border-highlight bg-highlight text-brand hover:brightness-95",
  outline: "border-brand bg-surface text-brand hover:bg-canvas",
};

const sizes: Record<Size, string> = {
  md: "min-h-13 px-6",
  sm: "min-h-11 px-4 text-base",
};

/** One component for buttons and button-styled links. Pass `href` to render a link. */
export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (rest.href !== undefined) {
    return <Link {...rest} className={classes} />;
  }
  return <button type="button" {...rest} className={classes} />;
}
