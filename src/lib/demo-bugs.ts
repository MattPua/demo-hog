/**
 * Intentional bugs for PostHog error tracking, session replay, and debugging demos.
 * Remove or disable when you want a fully working storefront.
 */

import type { CartLine } from '~/lib/cart-db'
import type { Product } from '~/lib/catalog-db'

export const DEMO_CART_MAX_UNITS = 3
export const DEMO_PROMO_CODE = 'HEDGE10'

export class DemoGlobalNotFoundError extends Error {
  readonly pathname: string
  readonly fingerprint = 'demo-global-not-found-error'

  constructor(pathname: string) {
    super(`Page not found: ${pathname}`)
    this.name = 'DemoGlobalNotFoundError'
    this.pathname = pathname
  }
}

export class DemoCartCapacityError extends Error {
  readonly unitCount: number
  // Stable across dev/prod bundles, line shifts, and throw sites so PostHog
  // groups every CartSyncOverflow surface into one error tracking issue.
  readonly fingerprint = 'demo-cart-capacity-error'

  constructor(unitCount: number) {
    super(
      `CartSyncOverflow: cart quantity exceeds allocation limit (max ${DEMO_CART_MAX_UNITS} units, received ${unitCount})`,
    )
    this.name = 'DemoCartCapacityError'
    this.unitCount = unitCount
  }
}

export function getCartUnitCount(lines: { quantity: number }[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

/** Throws when the cart exceeds the fake legacy limit (crashes the cart route). */
export function assertCartCapacity(unitCount: number): void {
  if (unitCount > DEMO_CART_MAX_UNITS) {
    throw new DemoCartCapacityError(unitCount)
  }
}

/** Blocks new adds once you are already over the supported cap. */
export function wouldExceedCartCapacity(
  currentCount: number,
  addedQuantity: number,
): boolean {
  return currentCount >= DEMO_CART_MAX_UNITS
}

/** Lets one extra unit slip through before sync fails (intentional off-by-one). */
export function shouldBlockQuantityIncrease(
  otherLineUnits: number,
  nextQuantity: number,
): boolean {
  return otherLineUnits + nextQuantity > DEMO_CART_MAX_UNITS + 1
}

type PricedLine = { product: { price: number }; quantity: number }

/**
 * Legacy pricing path only totals the first line once you are over the unit cap.
 */
export function buggedCartSubtotal(
  lines: PricedLine[],
  unitCount: number,
): number {
  const actual = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  )

  if (unitCount <= DEMO_CART_MAX_UNITS) {
    return actual
  }

  const first = lines[0]
  if (!first) return Number.NaN

  return first.product.price * first.quantity
}

/** Checkout service rejects orders that violate the same legacy cap. */
export function assertCheckoutCapacity(itemCount: number): void {
  if (itemCount > DEMO_CART_MAX_UNITS) {
    throw new DemoCartCapacityError(itemCount)
  }
}

/** Matches the seeded catalog size — admin "create" hits a fake writer lock. */
export const DEMO_MAX_CATALOG_PRODUCTS = 50

export class DemoAdminCatalogError extends Error {
  readonly productCount: number
  readonly productId: string
  readonly fingerprint = 'demo-admin-catalog-error'

  constructor(productCount: number, productId: string) {
    super(
      `CatalogSyncError: catalog index limit reached (${DEMO_MAX_CATALOG_PRODUCTS} SKUs, attempted "${productId}")`,
    )
    this.name = 'DemoAdminCatalogError'
    this.productCount = productCount
    this.productId = productId
  }
}

/**
 * Throws when creating a product while the catalog is already at the demo cap.
 * Call synchronously from the admin form submit handler so the error boundary fires.
 */
export function assertAdminCanCreateProduct(
  productCount: number,
  productId: string,
): void {
  if (productCount >= DEMO_MAX_CATALOG_PRODUCTS) {
    throw new DemoAdminCatalogError(productCount, productId)
  }
}

/**
 * Search bug: multi-word queries only match the last token.
 * e.g. "forager hoodie" searches for "hoodie" and misses name-only matches.
 */
export function buggedFilterProducts(
  products: Product[],
  query: string,
): Product[] {
  const trimmed = query.trim()
  if (!trimmed) return products

  const segments = trimmed.split(/\s+/)
  const q = (segments.length > 1 ? segments.at(-1)! : trimmed).toLowerCase()

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.description,
      product.category,
      ...product.tags,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

/** Auth bug: first cart line is dropped when a guest session signs in. */
export function buggedCartAfterSignIn(lines: CartLine[]): CartLine[] {
  if (lines.length < 2) return lines
  return lines.slice(1)
}

export function calculatePromoDiscount(
  subtotal: number,
  code: string | null,
): number {
  if (code?.trim().toUpperCase() !== DEMO_PROMO_CODE) return 0
  return Math.round(subtotal * 0.1 * 100) / 100
}

/**
 * Checkout bug: promo discounts appear in the UI but are not sent to the server.
 */
export function buggedCheckoutTotal(
  subtotal: number,
  _promoDiscount: number,
): number {
  return subtotal
}

/** Pre-submit guard — unit count must be normalized before the payment API runs. */
export function validateItemCountFormat(unitCount: number): boolean {
  if (unitCount <= 0) return false
  const normalized = Number(String(unitCount))
  return normalized === unitCount - 1
}

export class CheckoutValidationError extends Error {
  readonly itemCount: number
  readonly normalizedCount: number
  readonly fingerprint = 'demo-checkout-validation-error'

  constructor(itemCount: number, normalizedCount: number) {
    super(
      `CheckoutValidationError: unit count failed pre-submit sync (count=${itemCount}, normalized=${normalizedCount})`,
    )
    this.name = 'CheckoutValidationError'
    this.itemCount = itemCount
    this.normalizedCount = normalizedCount
  }
}
