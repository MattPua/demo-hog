import type { PostHogErrorBoundaryFallbackProps } from '@posthog/react'
import { Link } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export function PostHogErrorFallback({ error }: PostHogErrorBoundaryFallbackProps) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            Try refreshing the page or return to the shop to continue browsing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-lg bg-muted p-3 font-mono text-xs break-all text-muted-foreground">
            {message}
          </p>
        </CardContent>
        <CardFooter>
          <Button type="button" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to shop</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
