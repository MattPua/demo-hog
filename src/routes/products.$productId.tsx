import { Link, Navigate, createFileRoute, notFound } from '@tanstack/react-router'
import { useFeatureFlagVariantKey, usePostHog } from '@posthog/react'
import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { PageShell } from '~/components/PageShell'
import { getProductPresentation, getProductSlug } from '~/components/ProductCard'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { captureAddToCart, capturePdpViewed } from '~/lib/analytics'
import { useCatalog } from '~/lib/catalog-context'
import { useCart } from '~/lib/cart'
import { formatPrice, type Product } from '~/lib/products'
import { DEMO_FLAGS, PDP_CTA_VARIANTS } from '~/lib/demo-flags'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/products/$productId')({
  component: ProductPage,
})

function ProductPage() {
  const { productId } = Route.useParams()
  const { getProductById, products } = useCatalog()
  const product = products.find((item) => getProductSlug(item) === productId) ?? getProductById(productId)

  if (!product) {
    throw notFound()
  }

  const canonicalProductId = getProductSlug(product)
  if (productId !== canonicalProductId) {
    return <Navigate to="/products/$productId" params={{ productId: canonicalProductId }} replace />
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
  const viewedRef = useRef<string | null>(null)
  const presentation = getProductPresentation(product)

  useEffect(() => {
    if (viewedRef.current === product.id) return
    viewedRef.current = product.id
    capturePdpViewed(posthog, product, { source: 'navigation' })
  }, [posthog, product])

  const needsSize = product.sizes.length > 0

  function handleAddToCart() {
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
          { label: presentation.title },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className={`relative mx-auto flex aspect-[4/3] max-h-72 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br p-6 ${presentation.theme} lg:mx-0`}>
          <div className="absolute -top-12 -right-8 size-36 rounded-full bg-white/35" />
          <div className="absolute -bottom-16 -left-10 size-44 rounded-full bg-white/25" />
          <img
            src={presentation.hoggie}
            alt=""
            className="relative z-10 size-44 object-contain drop-shadow-[0_12px_10px_rgba(29,31,39,0.18)] sm:size-52"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="secondary">{product.category}</Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {presentation.title}
            </h1>
            <p className="text-3xl font-semibold text-primary">
              {formatPrice(product.price)}
            </p>
            <p className="text-muted-foreground">{presentation.description}</p>
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
