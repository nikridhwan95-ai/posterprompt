import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Field } from './Field'

interface CommonProps {
  id: string
  label: string
  hint?: string
  required?: boolean
  error?: string
  counter?: string
  counterWarning?: boolean
}

type TextFieldProps = CommonProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>

export function TextField({
  id,
  label,
  hint,
  required,
  error,
  counter,
  counterWarning,
  ...input
}: TextFieldProps) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      counter={counter}
      counterWarning={counterWarning}
    >
      <input
        {...input}
        id={id}
        type={input.type ?? 'text'}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') ||
          undefined
        }
        className="pp-input"
      />
    </Field>
  )
}

type TextAreaFieldProps = CommonProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>

export function TextAreaField({
  id,
  label,
  hint,
  required,
  error,
  counter,
  counterWarning,
  rows = 3,
  ...textarea
}: TextAreaFieldProps) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      counter={counter}
      counterWarning={counterWarning}
    >
      <textarea
        {...textarea}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') ||
          undefined
        }
        className="pp-input resize-y"
      />
    </Field>
  )
}
