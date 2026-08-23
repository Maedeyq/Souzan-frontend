import { cloneElement, useId, type ReactElement } from "react";

type FieldControlProps = {
  id?: string;
  required?: boolean;
  error?: boolean;
  "aria-describedby"?: string;
};

interface FormFieldProps {
  label: string;
  children: ReactElement<FieldControlProps>;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormField({ label, children, htmlFor, hint, error, required, className = "" }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor ?? generatedId;
  const messageId = `${fieldId}-message`;
  const control = cloneElement(children, {
    id: children.props.id ?? fieldId,
    required: children.props.required ?? required,
    error: children.props.error ?? Boolean(error),
    "aria-describedby": children.props["aria-describedby"] ?? (error || hint ? messageId : undefined),
  });

  return (
    <div className={`ui-field ${className}`.trim()}>
      <label className="ui-field__label" htmlFor={fieldId}>
        {label}
        {required && <span className="ui-field__required" aria-hidden="true">*</span>}
      </label>
      <div className="ui-field__control">{control}</div>
      {(error || hint) && (
        <p className={`ui-field__message ${error ? "ui-field__message--error" : ""}`} id={messageId} role={error ? "alert" : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
