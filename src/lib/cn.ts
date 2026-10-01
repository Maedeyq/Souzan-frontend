/** Joins class names, skipping falsy values. Keep class strings readable; no merging magic. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
