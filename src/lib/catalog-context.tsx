import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ensureCatalogSeeded,
  getAllProducts,
  getCategories,
  getProductById as getProductByIdFromDb,
  type Product,
} from '~/lib/catalog-db'
import { buggedFilterProducts } from '~/lib/demo-bugs'

type CatalogStatus = 'loading' | 'ready' | 'error'

type CatalogContextValue = {
  status: CatalogStatus
  error: string | null
  products: Product[]
  categories: string[]
  getProductById: (id: string) => Product | undefined
  searchProducts: (query: string) => Product[]
  refresh: (options?: { silent?: boolean }) => Promise<void>
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

async function loadCatalog() {
  await ensureCatalogSeeded()
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ])
  return { products, categories }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CatalogStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setStatus('loading')
      setError(null)
    }
    try {
      const data = await loadCatalog()
      setProducts(data.products)
      setCategories(data.categories)
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog')
      if (!options?.silent) {
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  )

  const searchProducts = useCallback(
    (query: string) => buggedFilterProducts(products, query),
    [products],
  )

  const value = useMemo(
    () => ({
      status,
      error,
      products,
      categories,
      getProductById,
      searchProducts,
      refresh,
    }),
    [
      status,
      error,
      products,
      categories,
      getProductById,
      searchProducts,
      refresh,
    ],
  )

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  )
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) {
    throw new Error('useCatalog must be used within CatalogProvider')
  }
  return ctx
}

/** Fetch a single product directly from IndexedDB. */
export async function fetchProductById(id: string) {
  await ensureCatalogSeeded()
  return getProductByIdFromDb(id)
}
