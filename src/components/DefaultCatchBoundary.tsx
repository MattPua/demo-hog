import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { usePostHog } from '@posthog/react'
import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import { captureWhenReady } from '~/lib/posthog-capture'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const posthog = usePostHog()
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  useEffect(() => {
    const err = error instanceof Error ? error : new Error(String(error))
    captureWhenReady(posthog, (client) => {
      client.captureException(err, {
        source: 'tanstack_router_error_boundary',
      })
    })
  }, [error, posthog])

  console.error('DefaultCatchBoundary Error:', error)

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while rendering this route.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorComponent error={error} />
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              router.invalidate()
            }}
          >
            Try again
          </Button>
          {isRoot ? (
            <Button asChild>
              <Link to="/">Home</Link>
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }}
            >
              Go back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
