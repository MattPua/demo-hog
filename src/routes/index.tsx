import { createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagVariantKey, usePostHog } from '@posthog/react'
import { useEffect, useMemo, useState } from 'react'
import { PageShell } from '~/components/PageShell'
import { ProductCard } from '~/components/ProductCard'
import { SearchBar } from '~/components/SearchBar'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '~/components/ui/scroll-area'
import { captureProductsSearched } from '~/lib/analytics'
import { useCatalog } from '~/lib/catalog-context'
import {
  DEMO_FLAGS,
  HOME_GRID_VARIANTS,
} from '~/lib/demo-flags'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/')({
  component: ShopPage,
})

function ShopPage() {
  const posthog = usePostHog()
  const gridVariant = useFeatureFlagVariantKey(DEMO_FLAGS.homeGridLayout)
  const spaciousGrid = gridVariant === HOME_GRID_VARIANTS.spacious
  const { products, categories, searchProducts } = useCatalog()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = searchProducts(query)
    if (category) {
      list = list.filter((p) => p.category === category)
    }
    return list
  }, [query, category, searchProducts])

  useEffect(() => {
    if (!query.trim() && !category) return

    const timer = window.setTimeout(() => {
      captureProductsSearched(posthog, {
        query,
        category,
        resultsCount: filtered.length,
      })
    }, 400)

    return () => window.clearTimeout(timer)
  }, [query, category, filtered.length, posthog])

  const showFeatured = !query && !category

  return (
    <PageShell className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden py-6">
      <section className="shrink-0 space-y-4">
        <Badge variant="secondary">Quill & Co. Demo Store</Badge>
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Hedgehog apparel for every forager
          </h1>
          <p className="text-muted-foreground">
            Hoodies, tees, socks, and accessories inspired by late-night garden
            adventures. Catalog data lives in your browser via IndexedDB.
          </p>
        </div>
        <SearchBar value={query} onChange={setQuery} className="max-w-md" />
      </section>

      <section className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={cn(
            'rounded-full border px-3 py-1 text-sm transition-colors',
            category === null
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              category === cat
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-muted',
            )}
          >
            {cat}
          </button>
        ))}
      </section>

      <ScrollArea className="min-h-0 flex-1 rounded-xl border">
        <div className="space-y-8 p-4">
          <section>
            <p className="mb-4 text-sm text-muted-foreground">
              {filtered.length} product{filtered.length === 1 ? '' : 's'}
              {query ? ` matching “${query}”` : ''}
            </p>
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No products found. Try a different search or category.
              </p>
            ) : (
              <div
                className={cn(
                  'grid gap-6 sm:grid-cols-2',
                  spaciousGrid ? 'lg:grid-cols-2 xl:gap-10' : 'lg:grid-cols-3',
                )}
              >
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {showFeatured ? (
            <section className="space-y-4 border-t pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold">Featured picks</h2>
                {gridVariant ? (
                  <p className="text-xs text-muted-foreground">
                    Grid experiment:{' '}
                    <code>{DEMO_FLAGS.homeGridLayout}</code> → {gridVariant}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products
                  .filter((p) => p.featured)
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </section>
          ) : null}
        </div>
      </ScrollArea>
    </PageShell>
  )
}
