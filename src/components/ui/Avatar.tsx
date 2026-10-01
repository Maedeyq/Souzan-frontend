import { cn } from "@/lib/cn";

type AvatarProps = { name: string; size?: "md" | "lg"; className?: string };

/** Initial-letter avatar. Decorative: the person's name must be rendered next to it. */
export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid flex-none place-items-center rounded-full bg-brand font-extrabold text-white",
        size === "lg" ? "size-15 text-2xl" : "size-12 text-xl",
        className,
      )}
    >
      {name.trim().charAt(0)}
    </span>
  );
}
