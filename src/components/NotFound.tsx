import { Link } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <SearchX className="size-5 text-muted-foreground" />
        </div>
        <CardTitle>Not found</CardTitle>
        <CardDescription>
          {children || 'The page you are looking for does not exist.'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
        <Button asChild>
          <Link to="/">Back to shop</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
