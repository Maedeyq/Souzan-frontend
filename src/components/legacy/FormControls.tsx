import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type ControlState = { error?: boolean };

export function Input({ error, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & ControlState) {
  return <input className={`ui-control ${className}`.trim()} aria-invalid={error || undefined} {...props} />;
}

export function Textarea({ error, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & ControlState) {
  return <textarea className={`ui-control ui-textarea ${className}`.trim()} aria-invalid={error || undefined} {...props} />;
}

export function Select({ error, className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & ControlState) {
  return (
    <select className={`ui-control ui-select ${className}`.trim()} aria-invalid={error || undefined} {...props}>
      {children}
    </select>
  );
}
