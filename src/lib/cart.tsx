import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '~/lib/auth-context'
import { useCatalog } from '~/lib/catalog-context'
import { getCartLines, saveCartLines, type CartLine } from '~/lib/cart-db'
import { logStoreContext, warnStoreContext } from '~/lib/console-context'
import {
  DEMO_CART_MAX_UNITS,
  buggedCartAfterSignIn,
  buggedCartSubtotal,
  buggedCheckoutTotal,
  calculatePromoDiscount,
  getCartUnitCount,
  shouldBlockQuantityIncrease,
  wouldExceedCartCapacity,
} from '~/lib/demo-bugs'
import type { Product } from '~/lib/products'

export type { CartLine } from '~/lib/cart-db'

export type CartLineWithProduct = CartLine & { product: Product }

type CartContextValue = {
  ready: boolean
  lines: CartLine[]
  addItem: (productId: string, quantity: number, size?: string) => void
  cartAtCapacity: boolean
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  promoCode: string | null
  promoDiscount: number
  displayTotal: number
  checkoutTotal: number
  applyPromo: (code: string) => { error?: string }
  clearPromo: () => void
  linesWithProducts: CartLineWithProduct[]
}

const CartContext = createContext<CartContextValue | null>(null)

function lineKey(productId: string, size?: string) {
  return `${productId}::${size ?? ''}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isReady: authReady } = useAuth()
  const { getProductById, status: catalogStatus } = useCatalog()
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const prevUserRef = useRef<typeof user | undefined>(undefined)

  useEffect(() => {
    if (catalogStatus !== 'ready') return
    let cancelled = false
    getCartLines()
      .then((stored) => {
        if (!cancelled) {
          setLines(stored)
          setReady(true)
          logStoreContext('cart', 'Cart loaded from IndexedDB', {
            line_count: stored.length,
            unit_count: getCartUnitCount(stored),
            product_ids: stored.map((line) => line.productId),
          })
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [catalogStatus])

  useEffect(() => {
    if (!ready) return
    saveCartLines(lines).catch(() => {})
  }, [lines, ready])

  // Intentional demo bug: signing in drops the first cart line.
  useEffect(() => {
    if (!authReady || !ready) return

    if (prevUserRef.current === undefined) {
      prevUserRef.current = user
      return
    }

    const wasLoggedOut = prevUserRef.current === null
    prevUserRef.current = user

    if (wasLoggedOut && user !== null) {
      setLines((prev) => {
        const next = buggedCartAfterSignIn(prev)
        logStoreContext('cart', 'Cart merged after sign-in', {
          user_id: user.id,
          lines_before: prev.length,
          lines_after: next.length,
          units_before: getCartUnitCount(prev),
          units_after: getCartUnitCount(next),
          dropped_product_id: prev[0]?.productId,
        })
        return next
      })
    }
  }, [user, authReady, ready])

  const addItem = useCallback(
    (productId: string, quantity: number, size?: string) => {
      setLines((prev) => {
        const currentUnits = getCartUnitCount(prev)
        if (wouldExceedCartCapacity(currentUnits, quantity)) {
          warnStoreContext('cart', 'Add to cart blocked — at capacity', {
            product_id: productId,
            quantity,
            unit_count: currentUnits,
            max_units: DEMO_CART_MAX_UNITS,
          })
          return prev
        }

        const key = lineKey(productId, size)
        const existing = prev.find(
          (l) => lineKey(l.productId, l.size) === key,
        )

        if (existing) {
          const next = prev.map((l) =>
            lineKey(l.productId, l.size) === key
              ? { ...l, quantity: l.quantity + quantity }
              : l,
          )
          logStoreContext('cart', 'Cart line quantity increased', {
            product_id: productId,
            size: size ?? null,
            added_quantity: quantity,
            unit_count: getCartUnitCount(next),
          })
          return next
        }
        const next = [...prev, { productId, quantity, size }]
        logStoreContext('cart', 'Cart line added', {
          product_id: productId,
          size: size ?? null,
          quantity,
          line_count: next.length,
          unit_count: getCartUnitCount(next),
        })
        return next
      })
    },
    [],
  )

  const removeItem = useCallback((productId: string, size?: string) => {
    const key = lineKey(productId, size)
    setLines((prev) =>
      prev.filter((l) => lineKey(l.productId, l.size) !== key),
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size?: string) => {
      if (quantity <= 0) {
        removeItem(productId, size)
        return
      }

      const key = lineKey(productId, size)
      setLines((prev) => {
        const otherUnits = getCartUnitCount(
          prev.filter((l) => lineKey(l.productId, l.size) !== key),
        )

        if (shouldBlockQuantityIncrease(otherUnits, quantity)) {
          return prev
        }

        return prev.map((l) =>
          lineKey(l.productId, l.size) === key ? { ...l, quantity } : l,
        )
      })
    },
    [removeItem],
  )

  const clearCart = useCallback(() => {
    setLines([])
    setPromoCode(null)
  }, [])

  const clearPromo = useCallback(() => {
    setPromoCode(null)
  }, [])

  const linesWithProducts = useMemo(
    () =>
      lines
        .map((line) => {
          const product = getProductById(line.productId)
          if (!product) return null
          return { ...line, product }
        })
        .filter((line): line is CartLineWithProduct => line !== null),
    [lines, getProductById],
  )

  const itemCount = useMemo(
    () => getCartUnitCount(linesWithProducts),
    [linesWithProducts],
  )

  const subtotal = useMemo(
    () => buggedCartSubtotal(linesWithProducts, itemCount),
    [linesWithProducts, itemCount],
  )

  const promoDiscount = useMemo(
    () => calculatePromoDiscount(subtotal, promoCode),
    [subtotal, promoCode],
  )

  const displayTotal = useMemo(
    () => Math.max(0, subtotal - promoDiscount),
    [subtotal, promoDiscount],
  )

  const checkoutTotal = useMemo(
    () => buggedCheckoutTotal(subtotal, promoDiscount),
    [subtotal, promoDiscount],
  )

  const applyPromo = useCallback(
    (code: string) => {
      const trimmed = code.trim()
      if (!trimmed) {
        return { error: 'Enter a promo code.' }
      }

      const discount = calculatePromoDiscount(subtotal, trimmed)
      if (discount <= 0) {
        return { error: 'That promo code is not valid.' }
      }

      setPromoCode(trimmed.toUpperCase())
      logStoreContext('cart', 'Promo code applied', {
        promo_code: trimmed.toUpperCase(),
        subtotal,
        promo_discount: discount,
        display_total: Math.max(0, subtotal - discount),
        checkout_total: buggedCheckoutTotal(subtotal, discount),
      })
      return {}
    },
    [subtotal],
  )

  const cartAtCapacity = itemCount >= DEMO_CART_MAX_UNITS

  const value = useMemo(
    () => ({
      ready,
      lines,
      addItem,
      cartAtCapacity,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      promoCode,
      promoDiscount,
      displayTotal,
      checkoutTotal,
      applyPromo,
      clearPromo,
      linesWithProducts,
    }),
    [
      ready,
      lines,
      addItem,
      cartAtCapacity,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      promoCode,
      promoDiscount,
      displayTotal,
      checkoutTotal,
      applyPromo,
      clearPromo,
      linesWithProducts,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}
