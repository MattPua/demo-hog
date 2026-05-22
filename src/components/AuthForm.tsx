import type { FormEvent } from 'react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export const authInputClass =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export const authLabelClass = 'text-sm font-medium'

export function AuthForm({
  title,
  description,
  error,
  submitLabel,
  disabled,
  onSubmit,
  children,
  footer,
}: {
  title: string
  description: string
  error: string | null
  submitLabel: string
  disabled?: boolean
  onSubmit: (form: FormData) => void | Promise<void>
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void onSubmit(new FormData(e.currentTarget))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">{children}</div>

      <Button type="submit" className="w-full" disabled={disabled}>
        {submitLabel}
      </Button>

      {footer ? (
        <div className={cn('text-center text-sm text-muted-foreground')}>
          {footer}
        </div>
      ) : null}
    </form>
  )
}
