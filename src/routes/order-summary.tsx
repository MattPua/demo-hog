import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { usePostHog } from '@posthog/react'
import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { PageShell } from '~/components/PageShell'
import { Button } from '~/components/ui/button'
import { captureAppException, posthogRequestHeaders } from '~/lib/analytics'
import { useCart } from '~/lib/cart'
import { formatPrice } from '~/lib/products'
import { useAuth } from '~/lib/auth-context'

export const Route = createFileRoute('/order-summary')({
  component: OrderSummaryPage,
})

function OrderSummaryPage() {
  const posthog = usePostHog()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { linesWithProducts, itemCount, subtotal, clearCart } = useCart()
  const [email, setEmail] = useState(user?.email ?? '')

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user?.email])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)

  const shipping = 0
  const total = subtotal + shipping

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
    setStatus('loading')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...posthogRequestHeaders(posthog),
        },
        body: JSON.stringify({
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
          shipping,
          total,
          item_count: itemCount,
        }),
      })

      if (!res.ok) throw new Error('Checkout failed')

      const data = (await res.json()) as { orderId: string }
      setOrderId(data.orderId)
      clearCart()
      setStatus('success')
    } catch (error) {
      setStatus('idle')
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
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>Free (demo)</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
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
            `Place order · ${formatPrice(total)}`
          )}
        </Button>
      </div>
    </PageShell>
  )
}
