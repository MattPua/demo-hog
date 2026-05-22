import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Settings } from 'lucide-react'
import { PageShell } from '~/components/PageShell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
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
