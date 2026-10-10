import { type ReactNode, useId } from 'react'

export const controlClass =
  'min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-hidden transition focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50'

export const FormField = ({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: (props: { id: string; describedBy?: string }) => ReactNode
}) => {
  const id = useId()
  const messageId = `${id}-message`
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800 dark:text-slate-100"
      >
        {label}
      </label>
      {children({ id, describedBy: hint || error ? messageId : undefined })}
      {(error || hint) && (
        <p
          id={messageId}
          className={`text-xs ${error ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}
