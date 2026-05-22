import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { usePostHog } from '@posthog/react'
import { useEffect, useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { CartCelebration } from '~/components/demo/CartCelebration'
import { TrustBadges } from '~/components/demo/TrustBadges'
import { PageShell } from '~/components/PageShell'
import { Button } from '~/components/ui/button'
import {
  captureCheckoutStarted,
  captureCartViewed,
  captureProductRemovedFromCart,
} from '~/lib/analytics'
import { useCart } from '~/lib/cart'
import { assertCartCapacity, DEMO_PROMO_CODE } from '~/lib/demo-bugs'
import { formatPrice } from '~/lib/products'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const posthog = usePostHog()
  const navigate = useNavigate()
  const {
    linesWithProducts,
    itemCount,
    subtotal,
    promoCode,
    promoDiscount,
    displayTotal,
    applyPromo,
    clearPromo,
    updateQuantity,
    removeItem,
  } = useCart()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)

  useEffect(() => {
    captureCartViewed(posthog, subtotal, itemCount)
  }, [posthog, subtotal, itemCount])

  // Intentional demo bug: opening the cart with >3 units crashes the page.
  assertCartCapacity(itemCount)

  function handleCheckout() {
    captureCheckoutStarted(posthog, displayTotal, itemCount)
    navigate({ to: '/order-summary' })
  }

  function handleApplyPromo() {
    setPromoError(null)
    const result = applyPromo(promoInput)
    if (result.error) {
      setPromoError(result.error)
    }
  }

  if (linesWithProducts.length === 0) {
    return (
      <PageShell className="flex flex-col items-center gap-4 py-16 text-center">
        <AppBreadcrumbs items={[{ label: 'Cart' }]} className="self-start" />
        <p className="text-5xl">🛒</p>
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="max-w-sm text-muted-foreground">
          Add some hedgehog gear from the shop before checking out.
        </p>
        <Button asChild>
          <Link to="/">Browse shop</Link>
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell className="space-y-8">
      <AppBreadcrumbs items={[{ label: 'Cart' }]} />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
        <p className="text-muted-foreground">
          {itemCount} item{itemCount === 1 ? '' : 's'} · {formatPrice(subtotal)}
        </p>
      </div>

      <CartCelebration />
      <TrustBadges />

      <div className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="promo-code" className="sr-only">
          Promo code
        </label>
        <input
          id="promo-code"
          type="text"
          value={promoInput}
          onChange={(e) => setPromoInput(e.target.value)}
          placeholder={`Promo code (try ${DEMO_PROMO_CODE})`}
          className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={handleApplyPromo}
        >
          Apply
        </Button>
      </div>
      {promoError ? (
        <p className="text-sm text-destructive">{promoError}</p>
      ) : null}
      {promoCode ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <p className="text-emerald-700 dark:text-emerald-300">
            {promoCode} applied — saved {formatPrice(promoDiscount)}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={clearPromo}>
            Remove
          </Button>
        </div>
      ) : null}

      <ul className="divide-y rounded-xl border">
        {linesWithProducts.map((line) => (
          <li
            key={`${line.productId}-${line.size ?? ''}`}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-emerald-50 text-3xl dark:from-amber-950/40 dark:to-emerald-950/40">
              {line.product.emoji}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <Link
                to="/products/$productId"
                params={{ productId: line.product.id }}
                className="font-medium hover:underline"
              >
                {line.product.name}
              </Link>
              {line.size ? (
                <p className="text-sm text-muted-foreground">Size: {line.size}</p>
              ) : null}
              <p className="font-medium">
                {formatPrice(line.product.price * line.quantity)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(line.productId, line.quantity - 1, line.size)
                }
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-6 text-center text-sm">{line.quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(line.productId, line.quantity + 1, line.size)
                }
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  captureProductRemovedFromCart(
                    posthog,
                    line.product,
                    line.quantity,
                    subtotal - line.product.price * line.quantity,
                  )
                  removeItem(line.productId, line.size)
                }}
                aria-label="Remove item"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-stretch gap-4 rounded-xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="text-2xl font-semibold">{formatPrice(displayTotal)}</p>
          {promoDiscount > 0 ? (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(subtotal)} before {promoCode}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Shipping calculated at checkout (demo: free)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/">Continue shopping</Link>
          </Button>
          <Button type="button" size="lg" onClick={handleCheckout}>
            Proceed to checkout
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
