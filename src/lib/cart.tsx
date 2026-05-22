import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useCatalog } from '~/lib/catalog-context'
import { getCartLines, saveCartLines, type CartLine } from '~/lib/cart-db'
import {
  DEMO_CART_MAX_UNITS,
  buggedCartSubtotal,
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
  linesWithProducts: CartLineWithProduct[]
}

const CartContext = createContext<CartContextValue | null>(null)

function lineKey(productId: string, size?: string) {
  return `${productId}::${size ?? ''}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProductById, status: catalogStatus } = useCatalog()
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (catalogStatus !== 'ready') return
    let cancelled = false
    getCartLines()
      .then((stored) => {
        if (!cancelled) {
          setLines(stored)
          setReady(true)
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

  const addItem = useCallback(
    (productId: string, quantity: number, size?: string) => {
      setLines((prev) => {
        const currentUnits = getCartUnitCount(prev)
        if (wouldExceedCartCapacity(currentUnits, quantity)) {
          return prev
        }

        const key = lineKey(productId, size)
        const existing = prev.find(
          (l) => lineKey(l.productId, l.size) === key,
        )

        if (existing) {
          return prev.map((l) =>
            lineKey(l.productId, l.size) === key
              ? { ...l, quantity: l.quantity + quantity }
              : l,
          )
        }
        return [...prev, { productId, quantity, size }]
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

  const clearCart = useCallback(() => setLines([]), [])

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
