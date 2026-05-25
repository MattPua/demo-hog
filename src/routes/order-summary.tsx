import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { usePostHog } from '@posthog/react'
import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { PageShell } from '~/components/PageShell'
import { Button } from '~/components/ui/button'
import { captureAppException, posthogRequestHeaders } from '~/lib/analytics'
import { useCart } from '~/lib/cart'
import { logStoreContext, warnStoreContext, errorStoreContext } from '~/lib/console-context'
import { CheckoutValidationError, validateItemCountFormat } from '~/lib/demo-bugs'
import { formatPrice } from '~/lib/products'
import { useAuth } from '~/lib/auth-context'

export const Route = createFileRoute('/order-summary')({
  component: OrderSummaryPage,
})

function OrderSummaryPage() {
  const posthog = usePostHog()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { linesWithProducts, itemCount, subtotal, promoCode, promoDiscount, displayTotal, checkoutTotal, clearCart } = useCart()
  const [email, setEmail] = useState(user?.email ?? '')

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user?.email])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const shipping = 0
  const total = checkoutTotal + shipping

  useEffect(() => {
    if (linesWithProducts.length === 0) return

    logStoreContext('checkout', 'Order summary viewed', {
      user_id: user?.id ?? null,
      line_count: linesWithProducts.length,
      item_count: itemCount,
      subtotal,
      promo_code: promoCode,
      promo_discount: promoDiscount,
      display_total: displayTotal,
      checkout_total: checkoutTotal,
      product_ids: linesWithProducts.map((line) => line.product.id),
    })
  }, [
    linesWithProducts,
    itemCount,
    subtotal,
    promoCode,
    promoDiscount,
    displayTotal,
    checkoutTotal,
    user?.id,
  ])

  if (linesWithProducts.length === 0 && status !== 'success') {
    return (
      <PageShell className="flex flex-col items-center gap-4 py-16 text-center">
        <AppBreadcrumbs
          items={[
            { label: 'Cart', to: '/cart' },
            { label: 'Checkout' },
          ]}
          className="self-start"
        />
        <p className="text-5xl">📦</p>
        <h1 className="text-2xl font-semibold">Nothing to check out</h1>
        <p className="text-muted-foreground">
          Add items to your cart before placing an order.
        </p>
        <Button asChild>
          <Link to="/">Back to shop</Link>
        </Button>
      </PageShell>
    )
  }

  async function placeOrder() {
    setCheckoutError(null)

    const normalizedCount = Number(String(itemCount))
    const validationPassed = validateItemCountFormat(itemCount)

    logStoreContext('checkout', 'Place order clicked', {
      user_id: user?.id ?? null,
      email: email || user?.email || null,
      item_count: itemCount,
      normalized_count: normalizedCount,
      validation_passed: validationPassed,
      display_total: displayTotal,
      checkout_total: checkoutTotal,
      promo_code: promoCode,
      promo_discount: promoDiscount,
    })

    if (!validationPassed) {
      const validationError = new CheckoutValidationError(
        itemCount,
        normalizedCount,
      )
      warnStoreContext('checkout', 'Pre-submit validation failed', {
        item_count: itemCount,
        normalized_count: normalizedCount,
        expected_for_pass: itemCount - 1,
      })
      captureAppException(posthog, validationError, {
        source: 'checkout_client',
        stage: 'pre_submit_validation',
        item_count: itemCount,
        normalized_count: normalizedCount,
        display_total: displayTotal,
        checkout_total: checkoutTotal,
        promo_code: promoCode,
      })
      setCheckoutError(
        'Unable to place your order right now. Please review your cart and try again.',
      )
      return
    }

    setStatus('loading')
    try {
      const payload = {
        user_id: user?.id,
        email: email || user?.email || undefined,
        items: linesWithProducts.map((line) => ({
          product_id: line.product.id,
          product_name: line.product.name,
          quantity: line.quantity,
          size: line.size,
          unit_price: line.product.price,
          line_total: line.product.price * line.quantity,
        })),
        subtotal,
        promo_code: promoCode ?? undefined,
        promo_discount: promoDiscount,
        display_total: displayTotal,
        shipping,
        total,
        item_count: itemCount,
      }

      logStoreContext('checkout', 'Submitting order to API', payload)

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...posthogRequestHeaders(posthog),
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Checkout failed')

      const data = (await res.json()) as { orderId: string }
      logStoreContext('checkout', 'Order placed successfully', {
        order_id: data.orderId,
        total,
        item_count: itemCount,
      })
      setOrderId(data.orderId)
      clearCart()
      setStatus('success')
    } catch (error) {
      setStatus('idle')
      errorStoreContext('checkout', 'Order placement failed', {
        error: error instanceof Error ? error.message : 'unknown',
        item_count: itemCount,
        checkout_total: checkoutTotal,
      })
      captureAppException(posthog, error, { source: 'checkout_client' })
    }
  }

  if (status === 'success') {
    return (
      <PageShell className="flex flex-col items-center gap-6 py-16 text-center">
        <AppBreadcrumbs
          items={[
            { label: 'Cart', to: '/cart' },
            { label: 'Checkout' },
          ]}
          className="self-start"
        />
        <CheckCircle2 className="size-16 text-emerald-600" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Order placed!</h1>
          <p className="text-muted-foreground">
            Thanks for shopping at Quill & Co. Your hedgehog gear is on its way.
          </p>
          {orderId ? (
            <p className="font-mono text-sm">Order #{orderId}</p>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={() => navigate({ to: '/' })}
        >
          Back to shop
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell className="mx-auto max-w-2xl space-y-8">
      <AppBreadcrumbs
        items={[
          { label: 'Cart', to: '/cart' },
          { label: 'Checkout' },
        ]}
      />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Order summary</h1>
        <p className="text-muted-foreground">
          Review your order, then place it to complete the demo checkout.
        </p>
      </div>

      <ul className="divide-y rounded-xl border">
        {linesWithProducts.map((line) => (
          <li
            key={`${line.productId}-${line.size ?? ''}`}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{line.product.emoji}</span>
              <div>
                <p className="font-medium">{line.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty {line.quantity}
                  {line.size ? ` · ${line.size}` : ''}
                </p>
              </div>
            </div>
            <p className="font-medium">
              {formatPrice(line.product.price * line.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="space-y-2 rounded-xl border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {promoDiscount > 0 ? (
          <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
            <span>Promo {promoCode}</span>
            <span>-{formatPrice(promoDiscount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>Free (demo)</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(displayTotal + shipping)}</span>
        </div>
      </div>

      {user ? (
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Ordering as <span className="font-medium text-foreground">{user.name}</span>{' '}
          (<span className="font-mono text-xs">{user.id}</span>) — PostHog distinct_id
          matches this user id.
        </p>
      ) : (
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="text-xs text-muted-foreground">
            <Link to="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{' '}
            to attach orders to a stable user id in PostHog.
          </p>
        </div>
      )}

      {checkoutError ? (
        <p className="text-sm text-destructive" role="alert">
          {checkoutError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/cart">Back to cart</Link>
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={status === 'loading'}
          onClick={placeOrder}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Placing order…
            </>
          ) : (
            `Place order · ${formatPrice(displayTotal + shipping)}`
          )}
        </Button>
      </div>
    </PageShell>
  )
}
