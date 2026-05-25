import { createFileRoute } from '@tanstack/react-router'
import { assertCheckoutCapacity } from '~/lib/demo-bugs'
import { logStoreContext, errorStoreContext } from '~/lib/console-context'
import { getPostHogClient } from '~/utils/posthog-server'
import { emitServerLog } from '~/utils/posthog-server-logs'

type CheckoutItem = {
  product_id: string
  product_name: string
  quantity: number
  size?: string
  unit_price: number
  line_total: number
}

type CheckoutBody = {
  user_id?: string
  email?: string
  items: CheckoutItem[]
  subtotal: number
  promo_code?: string
  promo_discount?: number
  display_total?: number
  shipping: number
  total: number
  item_count: number
}

function getPostHogIds(request: Request) {
  return {
    distinctId:
      request.headers.get('X-PostHog-Distinct-Id') ||
      request.headers.get('X-POSTHOG-DISTINCT-ID') ||
      'anonymous',
    sessionId:
      request.headers.get('X-PostHog-Session-Id') ||
      request.headers.get('X-POSTHOG-SESSION-ID') ||
      undefined,
  }
}

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { distinctId, sessionId } = getPostHogIds(request)
        const posthog = getPostHogClient()

        try {
          const body = (await request.json()) as CheckoutBody

          logStoreContext('checkout-api', 'Checkout request received', {
            distinct_id: distinctId,
            session_id: sessionId ?? null,
            user_id: body.user_id ?? null,
            email: body.email ?? null,
            item_count: body.item_count,
            subtotal: body.subtotal,
            promo_code: body.promo_code ?? null,
            promo_discount: body.promo_discount ?? null,
            display_total: body.display_total ?? null,
            total: body.total,
            line_items: body.items.length,
          })

          // Intentional demo bug: checkout rejects carts over the legacy unit cap.
          assertCheckoutCapacity(body.item_count)

          const orderId = `QC-${Date.now().toString(36).toUpperCase()}`

          logStoreContext('checkout-api', 'Checkout order completed', {
            order_id: orderId,
            item_count: body.item_count,
            total: body.total,
          })

          posthog.capture({
            distinctId,
            event: 'order_completed',
            properties: {
              $session_id: sessionId,
              order_id: orderId,
              user_id: body.user_id,
              email: body.email,
              subtotal: body.subtotal,
              shipping: body.shipping,
              total: body.total,
              item_count: body.item_count,
              products: body.items.map((i) => i.product_id),
              line_items: body.items,
            },
          })

          emitServerLog('Checkout order completed', {
            severity: 'info',
            attributes: {
              distinct_id: distinctId,
              order_id: orderId,
              item_count: body.item_count,
              total: body.total,
            },
          })

          return Response.json({ orderId, success: true })
        } catch (error) {
          errorStoreContext('checkout-api', 'Checkout request failed', {
            distinct_id: distinctId,
            error: error instanceof Error ? error.message : 'unknown',
          })
          emitServerLog('Checkout failed', {
            severity: 'error',
            attributes: {
              distinct_id: distinctId,
              error: error instanceof Error ? error.message : 'unknown',
            },
          })
          posthog.captureException(error, distinctId, {
            $session_id: sessionId,
            source: 'checkout_api',
          })
          return Response.json({ error: 'Checkout failed' }, { status: 500 })
        }
      },
    },
  },
})
