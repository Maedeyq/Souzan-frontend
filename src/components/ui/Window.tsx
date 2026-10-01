import type { ReactNode } from "react";

type WindowProps = { title: string; children: ReactNode };

/** macOS-style window frame. Use sparingly, for product previews and one hero moment per page. */
export function Window({ title, children }: WindowProps) {
  return (
    <div className="overflow-hidden rounded-window border border-line bg-surface shadow-window">
      <div className="flex items-center gap-2 border-b border-line bg-canvas px-4 py-3.5">
        <span className="size-3 rounded-full bg-accent" aria-hidden="true" />
        <span className="size-3 rounded-full bg-highlight" aria-hidden="true" />
        <span className="size-3 rounded-full bg-muted/40" aria-hidden="true" />
        <span className="me-11 flex-1 text-center text-[15px] font-semibold text-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}
