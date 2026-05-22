import type { PostHog } from 'posthog-js'
import { captureWhenReady } from '~/lib/posthog-capture'
import {
  logCartItemAdded,
  logCartItemRemoved,
  logCartViewed,
  logCheckoutStarted,
  logPdpViewed,
  logProductsSearched,
} from '~/lib/posthog-logs'
import type { Product } from '~/lib/products'

const COMMERCE = { event_category: 'commerce' } as const

function capture(
  posthog: PostHog | undefined | null,
  fn: (client: PostHog) => void,
) {
  captureWhenReady(posthog, fn)
}

export function productProperties(product: Product) {
  return {
    product_id: product.id,
    product_name: product.name,
    category: product.category,
    price: product.price,
    currency: 'USD',
  }
}

/** User opened a product detail page (PDP). */
export function capturePdpViewed(
  posthog: PostHog | undefined | null,
  product: Product,
  options?: { source?: string },
) {
  capture(posthog, (client) => client.capture('pdp_viewed', {
    ...COMMERCE,
    ...productProperties(product),
    page_type: 'pdp',
    path: `/products/${product.id}`,
    featured: product.featured,
    tags: product.tags,
    source: options?.source ?? 'direct',
  }))
  logPdpViewed(posthog, {
    ...productProperties(product),
    source: options?.source ?? 'direct',
  })
}

/** User searched or filtered the product catalog. */
export function captureProductsSearched(
  posthog: PostHog | undefined | null,
  options: {
    query: string
    category: string | null
    resultsCount: number
  },
) {
  const trimmedQuery = options.query.trim()
  capture(posthog, (client) => client.capture('products_searched', {
    ...COMMERCE,
    query: trimmedQuery,
    category: options.category,
    results_count: options.resultsCount,
    has_results: options.resultsCount > 0,
    has_query: trimmedQuery.length > 0,
    has_category_filter: options.category != null,
  }))
  logProductsSearched(posthog, {
    query: trimmedQuery,
    category: options.category,
    results_count: options.resultsCount,
  })
}

/** User added a line item to the cart. */
export function captureAddToCart(
  posthog: PostHog | undefined | null,
  product: Product,
  options: {
    quantity: number
    size?: string
    cartTotal: number
    cartItemCount: number
    source: 'pdp' | 'listing'
  },
) {
  const lineTotal = product.price * options.quantity
  capture(posthog, (client) => client.capture('add_to_cart', {
    ...COMMERCE,
    ...productProperties(product),
    quantity: options.quantity,
    size: options.size ?? null,
    line_total: lineTotal,
    cart_total: options.cartTotal,
    cart_item_count: options.cartItemCount,
    source: options.source,
  }))
  logCartItemAdded(posthog, {
    ...productProperties(product),
    quantity: options.quantity,
    size: options.size ?? null,
    line_total: lineTotal,
    cart_total: options.cartTotal,
    cart_item_count: options.cartItemCount,
    source: options.source,
  })
}

/** User clicked through from the listing to a PDP. */
export function captureProductListingClicked(
  posthog: PostHog | undefined | null,
  product: Product,
) {
  capture(posthog, (client) => client.capture('product_listing_clicked', {
    ...COMMERCE,
    ...productProperties(product),
    page_type: 'listing',
    destination_path: `/products/${product.id}`,
  }))
}

export function captureProductRemovedFromCart(
  posthog: PostHog | undefined | null,
  product: Product,
  quantity: number,
  cartTotal: number,
) {
  capture(posthog, (client) => client.capture('product_removed_from_cart', {
    ...COMMERCE,
    ...productProperties(product),
    quantity,
    cart_total: cartTotal,
  }))
  logCartItemRemoved(posthog, {
    ...productProperties(product),
    quantity,
    cart_total: cartTotal,
  })
}

export function captureCartViewed(
  posthog: PostHog | undefined | null,
  cartTotal: number,
  cartItemCount: number,
) {
  capture(posthog, (client) => client.capture('cart_viewed', {
    ...COMMERCE,
    cart_total: cartTotal,
    cart_item_count: cartItemCount,
  }))
  logCartViewed(posthog, {
    cart_total: cartTotal,
    cart_item_count: cartItemCount,
  })
}

export function captureCheckoutStarted(
  posthog: PostHog | undefined | null,
  cartTotal: number,
  cartItemCount: number,
) {
  capture(posthog, (client) => client.capture('checkout_started', {
    ...COMMERCE,
    cart_total: cartTotal,
    cart_item_count: cartItemCount,
  }))
  logCheckoutStarted(posthog, {
    cart_total: cartTotal,
    cart_item_count: cartItemCount,
  })
}

export function captureProductCreated(
  posthog: PostHog | undefined | null,
  product: Product,
) {
  capture(posthog, (client) =>
    client.capture('product_created', productProperties(product)),
  )
}

export function captureProductUpdated(
  posthog: PostHog | undefined | null,
  product: Product,
) {
  capture(posthog, (client) =>
    client.capture('product_updated', productProperties(product)),
  )
}

export function captureProductDeleted(
  posthog: PostHog | undefined | null,
  product: Product,
) {
  capture(posthog, (client) =>
    client.capture('product_deleted', productProperties(product)),
  )
}

export function captureAppException(
  posthog: PostHog | undefined | null,
  error: unknown,
  properties?: Record<string, unknown>,
) {
  const err = error instanceof Error ? error : new Error(String(error))
  capture(posthog, (client) => client.captureException(err, properties))
}

export function posthogRequestHeaders(posthog: PostHog): HeadersInit {
  return {
    'X-PostHog-Distinct-Id': posthog.get_distinct_id(),
    'X-PostHog-Session-Id': posthog.get_session_id() ?? '',
  }
}
