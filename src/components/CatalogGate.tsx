import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { PageShell } from '~/components/PageShell'
import { Button } from '~/components/ui/button'
import { useCatalog } from '~/lib/catalog-context'

export function CatalogGate({ children }: { children: ReactNode }) {
  const { status, error, refresh } = useCatalog()

  if (status === 'loading') {
    return (
      <PageShell className="flex flex-col items-center gap-3 py-24 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading catalog from your browser…</p>
      </PageShell>
    )
  }

  if (status === 'error') {
    return (
      <PageShell className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-medium">Could not open the local catalog database</p>
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        <Button type="button" onClick={() => refresh()}>
          Try again
        </Button>
      </PageShell>
    )
  }

  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>
}
