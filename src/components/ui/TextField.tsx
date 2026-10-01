import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  hint?: string;
  error?: string;
};

/** Labeled input. The label is always visible (never placeholder-only). */
export function TextField({ label, hint, error, className, ...props }: TextFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold text-brand">
        {label}
      </label>
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-base text-muted">
          {hint}
        </p>
      ) : null}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "min-h-13 rounded-control border-2 bg-surface px-4 text-ink placeholder:text-muted",
          error ? "border-accent" : "border-line focus:border-brand",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-base font-semibold text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
