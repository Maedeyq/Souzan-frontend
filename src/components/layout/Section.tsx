import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-page px-5", className)} {...props} />;
}

type SectionProps = ComponentProps<"section"> & { tone?: "plain" | "canvas" };

/** Standard page band: vertical rhythm + centered container. Every page is a stack of Sections. */
export function Section({ tone = "plain", className, children, ...props }: SectionProps) {
  return (
    <section className={cn("py-14", tone === "canvas" && "bg-canvas", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("mb-6 text-3xl", className)} {...props} />;
}
