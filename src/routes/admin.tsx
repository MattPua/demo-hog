import {
  Link,
  Navigate,
  Outlet,
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { Settings } from 'lucide-react'
import { PageShell } from '~/components/PageShell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { readSession, useAuth } from '~/lib/auth-context'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    // Auth lives in the browser (localStorage session), so only guard on the
    // client. On the server readSession() is always null; redirecting there
    // would bounce signed-in people whose session the server cannot see.
    if (typeof window !== 'undefined' && !readSession()) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { isReady, isAuthenticated } = useAuth()

  if (!isReady) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />
  }

  return (
    <PageShell className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <Badge variant="secondary">IndexedDB</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage the local product catalog stored in your browser.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/">Back to shop</Link>
        </Button>
      </div>
      <Outlet />
    </PageShell>
  )
}
