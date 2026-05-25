import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useFeatureFlagVariantKey, usePostHog } from '@posthog/react'
import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { PageShell } from '~/components/PageShell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { captureAddToCart, capturePdpViewed } from '~/lib/analytics'
import { useCatalog } from '~/lib/catalog-context'
import { useCart } from '~/lib/cart'
import {
  DEMO_CART_MAX_UNITS,
  wouldExceedCartCapacity,
} from '~/lib/demo-bugs'
import { logCommerceWarning } from '~/lib/posthog-logs'
import { formatPrice, type Product } from '~/lib/products'
import { DEMO_FLAGS, PDP_CTA_VARIANTS } from '~/lib/demo-flags'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/products/$productId')({
  component: ProductPage,
})

function ProductPage() {
  const { productId } = Route.useParams()
  const { getProductById } = useCatalog()
  const product = getProductById(productId)

  if (!product) {
    throw notFound()
  }

  return <ProductDetails product={product} />
}

function ProductDetails({ product }: { product: Product }) {
  const posthog = usePostHog()
  const ctaVariant = useFeatureFlagVariantKey(DEMO_FLAGS.pdpCtaCopy)
  const friendlyCta = ctaVariant === PDP_CTA_VARIANTS.friendly
  const { addItem, itemCount, subtotal } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState(product.sizes[0] ?? undefined)
  const [added, setAdded] = useState(false)
  const addLabel = added
    ? 'Added to cart'
    : friendlyCta
      ? 'Add to your hedgehog haul 🦔'
      : 'Add to cart'
  const [cartError, setCartError] = useState<string | null>(null)
  const viewedRef = useRef<string | null>(null)

  useEffect(() => {
    if (viewedRef.current === product.id) return
    viewedRef.current = product.id
    capturePdpViewed(posthog, product, { source: 'navigation' })
  }, [posthog, product])

  const needsSize = product.sizes.length > 0

  function handleAddToCart() {
    setCartError(null)

    if (wouldExceedCartCapacity(itemCount, quantity)) {
      setCartError('Unable to add that quantity to your cart.')
      logCommerceWarning(posthog, 'Add to cart blocked — cart at capacity', {
        product_id: product.id,
        quantity,
        cart_item_count: itemCount,
        max_units: DEMO_CART_MAX_UNITS,
      })
      return
    }

    addItem(product.id, quantity, size)

    captureAddToCart(posthog, product, {
      quantity,
      size,
      cartTotal: subtotal + product.price * quantity,
      cartItemCount: itemCount + quantity,
      source: 'pdp',
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  return (
    <PageShell>
      <AppBreadcrumbs
        items={[
          { label: product.category },
          { label: product.name },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="mx-auto flex aspect-[4/3] max-h-72 w-full max-w-sm items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 text-6xl sm:text-7xl lg:mx-0 dark:from-amber-950/40 dark:to-emerald-950/40">
          {product.emoji}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary">{product.category}</Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold text-primary">
              {formatPrice(product.price)}
            </p>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {needsSize ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={cn(
                      'min-w-12 rounded-lg border px-3 py-2 text-sm transition-colors',
                      size === s
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {cartError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {cartError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              size="lg"
              className={cn(friendlyCta && !added && 'bg-violet-600 hover:bg-violet-700')}
              onClick={handleAddToCart}
              disabled={needsSize && !size}
            >
              <ShoppingCart className="size-4" />
              {addLabel}
            </Button>
            {ctaVariant ? (
              <p className="w-full text-xs text-muted-foreground">
                CTA experiment: <code>{DEMO_FLAGS.pdpCtaCopy}</code> → {ctaVariant}
              </p>
            ) : null}
            <Button asChild variant="outline" size="lg">
              <Link to="/cart">View cart</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
