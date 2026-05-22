import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { usePostHog } from '@posthog/react'
import { ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { ProductForm } from '~/components/admin/ProductForm'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  captureProductDeleted,
  captureProductUpdated,
} from '~/lib/analytics'
import { deleteProduct, putProduct } from '~/lib/catalog-db'
import { useCatalog } from '~/lib/catalog-context'
import { formStateToProduct } from '~/lib/product-form'
import type { Product } from '~/lib/products'

export const Route = createFileRoute('/admin/product/$id')({
  component: AdminEditProductPage,
})

function AdminEditProductPage() {
  const { id } = Route.useParams()
  const { getProductById } = useCatalog()
  const product = getProductById(id)

  if (!product) {
    throw notFound()
  }

  return <AdminEditProductForm product={product} />
}

function AdminEditProductForm({ product }: { product: Product }) {
  const navigate = useNavigate()
  const posthog = usePostHog()
  const { categories, refresh } = useCatalog()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave(
    state: Parameters<typeof formStateToProduct>[0],
  ) {
    setError(null)
    const result = formStateToProduct(state, { preserveId: true })
    if ('error' in result) {
      setError(result.error)
      return
    }

    setSaving(true)
    try {
      await putProduct(result)
      captureProductUpdated(posthog, result)
      await refresh({ silent: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete “${product.name}”? This cannot be undone.`,
      )
    ) {
      return
    }

    setDeleting(true)
    try {
      await deleteProduct(product.id)
      captureProductDeleted(posthog, product)
      await refresh({ silent: true })
      navigate({ to: '/admin' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AppBreadcrumbs
        items={[
          { label: 'Admin', to: '/admin' },
          { label: product.name },
        ]}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin">← All products</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a
            href={`/products/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            <ExternalLink className="size-3.5" />
            View in shop
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{product.emoji}</span>
            Edit {product.name}
          </CardTitle>
          <CardDescription>
            ID: <span className="font-mono">{product.id}</span> — changes persist
            in IndexedDB.
          </CardDescription>
        </CardHeader>
        <CardContent className="border-t pt-6">
          {error ? (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <ProductForm
            mode="edit"
            initial={product}
            categories={categories}
            existingIds={[]}
            submitLabel={saving ? 'Saving…' : 'Save changes'}
            disabled={saving || deleting}
            onSubmit={handleSave}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Remove this product from the local catalog. Cart lines referencing
            it will show incomplete until removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
            {deleting ? 'Deleting…' : 'Delete product'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
