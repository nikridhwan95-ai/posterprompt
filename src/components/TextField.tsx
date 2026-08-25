import { useState } from 'react'
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
  // Kaunter aksara hanya dipaparkan semasa medan difokus atau apabila had
  // hampir dicecah (counterWarning); dua belas baris "0 / 500" yang statik
  // hanya hingar sebelum pengguna menaip apa-apa (§5.5).
  const [focused, setFocused] = useState(false)

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      counter={focused || counterWarning ? counter : undefined}
      counterWarning={counterWarning}
    >
      <input
        {...input}
        id={id}
        onFocus={(event) => {
          setFocused(true)
          input.onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          input.onBlur?.(event)
        }}
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
  const [focused, setFocused] = useState(false)

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      counter={focused || counterWarning ? counter : undefined}
      counterWarning={counterWarning}
    >
      <textarea
        {...textarea}
        id={id}
        onFocus={(event) => {
          setFocused(true)
          textarea.onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          textarea.onBlur?.(event)
        }}
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
