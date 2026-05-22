import type { ComponentProps } from 'react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

type DecoyButtonProps = Omit<ComponentProps<typeof Button>, 'asChild' | 'onClick'>

/** Looks like a normal button but performs no action (for session replay / autocapture demos). */
export function DecoyButton({ className, type = 'button', ...props }: DecoyButtonProps) {
  return (
    <Button
      type={type}
      className={cn(className)}
      {...props}
      onClick={(event) => {
        event.preventDefault()
      }}
    />
  )
}
