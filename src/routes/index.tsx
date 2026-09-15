import { Link, createFileRoute } from '@tanstack/react-router'
import { useFeatureFlagVariantKey, usePostHog } from '@posthog/react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { CategoryFilter } from '~/components/CategoryFilter'
import { PageShell } from '~/components/PageShell'
import { getProductPresentation, getProductSlug, ProductCard } from '~/components/ProductCard'
import { SearchBar } from '~/components/SearchBar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { captureProductsSearched } from '~/lib/analytics'
import { useCatalog } from '~/lib/catalog-context'
import { logStoreContext } from '~/lib/console-context'
import {
  DEMO_FLAGS,
  HOME_GRID_VARIANTS,
} from '~/lib/demo-flags'
import { cn } from '~/lib/utils'
import { formatPrice } from '~/lib/products'

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
      const tokens = query.trim().split(/\s+/).filter(Boolean)
      logStoreContext('search', 'Catalog search executed', {
        query,
        tokens,
        effective_token: tokens.length > 1 ? tokens.at(-1) : tokens[0] ?? '',
        category,
        results_count: filtered.length,
        has_results: filtered.length > 0,
      })
      captureProductsSearched(posthog, {
        query,
        category,
        resultsCount: filtered.length,
      })
    }, 400)

    return () => window.clearTimeout(timer)
  }, [query, category, filtered.length, posthog])

  const showFeatured = !query && !category
  const featuredProduct = products.find((product) => product.featured) ?? products[0]
  const featuredPresentation = featuredProduct
    ? getProductPresentation(featuredProduct)
    : null

  function captureFeaturedBannerClick() {
    if (!featuredProduct) return
    posthog.capture('featured_banner_clicked', {
      product_id: featuredProduct.id,
      product_name: featuredPresentation?.title,
      placement: 'home',
    })
  }

  return (
    <PageShell className="space-y-8 py-6">
      <section className="space-y-4">
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

      {showFeatured && featuredProduct && featuredPresentation ? (
        <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(115deg,var(--posthog-purple)_0%,var(--posthog-blue)_52%,var(--posthog-tangerine)_100%)] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-12">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-white/8 [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]" />
          <div className="absolute -top-24 -right-12 size-72 rounded-full bg-[var(--posthog-lemon)]/50 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_280px]">
            <div className="max-w-xl space-y-5">
              <Badge className="border-0 bg-white/15 text-white hover:bg-white/15">
                <Sparkles className="size-3.5" />
                Featured find
              </Badge>
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/75">Made for late-night foraging</p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                  {featuredPresentation.title}
                </h2>
                <p className="max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
                  {featuredProduct.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="bg-white text-[var(--posthog-purple)] shadow-none hover:bg-white/90">
                  <Link
                    to="/products/$productId"
                    params={{ productId: getProductSlug(featuredProduct) }}
                    onClick={captureFeaturedBannerClick}
                  >
                    Shop featured item
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <span className="text-xl font-semibold">{formatPrice(featuredProduct.price)}</span>
              </div>
            </div>
            <div className="relative mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-full border border-white/25 bg-white/12 backdrop-blur-sm md:max-w-70">
              <img
                src={featuredPresentation.hoggie}
                alt=""
                className="size-48 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.25)] sm:size-56"
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <CategoryFilter
          categories={categories}
          value={category}
          onChange={setCategory}
        />

        <p className="text-sm text-muted-foreground">
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
        <section className="space-y-4 border-t pt-8">
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
    </PageShell>
  )
}
