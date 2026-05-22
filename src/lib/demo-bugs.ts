/**
 * Intentional bugs for PostHog error tracking, session replay, and debugging demos.
 * Remove or disable when you want a fully working storefront.
 */

export const DEMO_CART_MAX_UNITS = 3

export class DemoCartCapacityError extends Error {
  readonly unitCount: number

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
