import * as React from 'react'
import { cx } from '~/lib/utils'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: { message?: string }
}
const TextArea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ error, label, name, id = name, ...props }, ref) => (
    <div>
      {label && (
        <label
          aria-required={props.required}
          className="block px-4 pt-2"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        name={name}
        {...props}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error-message` : undefined}
        className={cx(
          'p-4 pt-2 text-lg w-full dark:bg-gray-800 dark:placeholder-gray-600',
          props.className
        )}
      />
      {error && (
        <p
          id={`${name}-error-message`}
          role="alert"
          className="p-1 text-center text-red-800 bg-red-300"
        >
          {error.message}
        </p>
      )}
    </div>
  )
)

export default TextArea
