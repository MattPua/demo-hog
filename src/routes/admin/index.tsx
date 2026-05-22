import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { usePostHog } from '@posthog/react'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { ProductForm } from '~/components/admin/ProductForm'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { captureProductCreated } from '~/lib/analytics'
import {
  assertAdminCanCreateProduct,
  DEMO_MAX_CATALOG_PRODUCTS,
} from '~/lib/demo-bugs'
import { logCommerceError } from '~/lib/posthog-logs'
import { putProduct } from '~/lib/catalog-db'
import { useCatalog } from '~/lib/catalog-context'
import { formStateToProduct } from '~/lib/product-form'
import { formatPrice } from '~/lib/products'

export const Route = createFileRoute('/admin/')({
  component: AdminIndexPage,
})

function AdminIndexPage() {
  const posthog = usePostHog()
  const navigate = useNavigate()
  const { products, categories, refresh } = useCatalog()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name))

  function handleCreate(state: Parameters<typeof formStateToProduct>[0]) {
    setError(null)
    const result = formStateToProduct(state)
    if ('error' in result) {
      setError(result.error)
      return
    }

    if (products.some((p) => p.id === result.id)) {
      setError(`Product ID “${result.id}” already exists.`)
      return
    }

    logCommerceError(posthog, 'Admin create product blocked by catalog sync', {
      product_id: result.id,
      product_count: products.length,
      max_products: DEMO_MAX_CATALOG_PRODUCTS,
    })

    // Intentional demo bug: throws when catalog already has 50 products.
    assertAdminCanCreateProduct(products.length, result.id)

    void saveNewProduct(result)
  }

  async function saveNewProduct(result: Exclude<
    ReturnType<typeof formStateToProduct>,
    { error: string }
  >) {
    setSaving(true)
    try {
      await putProduct(result)
      captureProductCreated(posthog, result)
      await refresh({ silent: true })
      setShowForm(false)
      navigate({
        to: '/admin/product/$id',
        params: { id: result.id },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <AppBreadcrumbs items={[{ label: 'Admin' }]} />
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" />
              Add product
            </CardTitle>
            <CardDescription>
              New products are saved to IndexedDB and appear in the shop
              immediately.
            </CardDescription>
          </div>
          {!showForm ? (
            <Button type="button" size="sm" onClick={() => setShowForm(true)}>
              New product
            </Button>
          ) : null}
        </CardHeader>
        {showForm ? (
          <CardContent className="border-t pt-6">
            {error ? (
              <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <ProductForm
              mode="create"
              categories={categories}
              existingIds={products.map((p) => p.id)}
              submitLabel={saving ? 'Saving…' : 'Create product'}
              disabled={saving}
              onCancel={() => {
                setShowForm(false)
                setError(null)
              }}
              onSubmit={handleCreate}
            />
          </CardContent>
        ) : null}
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">All products ({sorted.length})</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{product.emoji}</span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    {product.featured ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to="/admin/product/$id"
                        params={{ id: product.id }}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              No products yet. Add one above.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
