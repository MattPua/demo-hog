import seedCatalog from '~/data/products.json'
import {
  isIndexedDbAvailable,
  openDatabase,
  readFromStore,
  writeInTransaction,
} from '~/lib/idb'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  emoji: string
  tags: string[]
  sizes: string[]
  featured: boolean
}

const DB_NAME = 'quill-co'
const DB_VERSION = 2
const SEED_VERSION = '2'

const STORES = {
  meta: 'meta',
  categories: 'categories',
  products: 'products',
  cartLines: 'cart_lines',
  users: 'users',
} as const

let dbPromise: Promise<IDBDatabase> | null = null

function createStores(db: IDBDatabase) {
  if (!db.objectStoreNames.contains(STORES.meta)) {
    db.createObjectStore(STORES.meta)
  }
  if (!db.objectStoreNames.contains(STORES.categories)) {
    db.createObjectStore(STORES.categories, { keyPath: 'name' })
  }
  if (!db.objectStoreNames.contains(STORES.products)) {
    const products = db.createObjectStore(STORES.products, { keyPath: 'id' })
    products.createIndex('category', 'category', { unique: false })
    products.createIndex('featured', 'featured', { unique: false })
  }
  if (!db.objectStoreNames.contains(STORES.cartLines)) {
    db.createObjectStore(STORES.cartLines, { keyPath: 'key' })
  }
  if (!db.objectStoreNames.contains(STORES.users)) {
    const users = db.createObjectStore(STORES.users, { keyPath: 'id' })
    users.createIndex('email', 'email', { unique: true })
  }
}

export function getCatalogDatabase(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error('IndexedDB is not available'))
  }
  if (!dbPromise) {
    dbPromise = openDatabase(DB_NAME, DB_VERSION, createStores)
  }
  return dbPromise
}

function seedCatalogData(db: IDBDatabase): Promise<void> {
  return writeInTransaction(
    db,
    [STORES.categories, STORES.products, STORES.meta],
    (tx) => {
      const categoriesStore = tx.objectStore(STORES.categories)
      const productsStore = tx.objectStore(STORES.products)
      const metaStore = tx.objectStore(STORES.meta)

      categoriesStore.clear()
      productsStore.clear()

      for (const name of seedCatalog.categories) {
        categoriesStore.put({ name })
      }

      for (const product of seedCatalog.products as Product[]) {
        productsStore.put(product)
      }

      metaStore.put(SEED_VERSION, 'seedVersion')
    },
  )
}

async function getMeta(db: IDBDatabase, key: string): Promise<string | undefined> {
  return readFromStore(db, STORES.meta, (store) => store.get(key))
}

/** Opens the DB and seeds from JSON when empty or seed version changed. */
export async function ensureCatalogSeeded(): Promise<void> {
  const db = await getCatalogDatabase()
  const currentVersion = await getMeta(db, 'seedVersion')

  if (currentVersion === SEED_VERSION) {
    const count = await readFromStore(db, STORES.products, (store) => store.count())
    if (count > 0) return
  }

  await seedCatalogData(db)
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getCatalogDatabase()
  return readFromStore(db, STORES.products, (store) => store.getAll())
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = await getCatalogDatabase()
  return readFromStore(db, STORES.products, (store) => store.get(id))
}

export async function getCategories(): Promise<string[]> {
  const db = await getCatalogDatabase()
  const rows = await readFromStore(db, STORES.categories, (store) =>
    store.getAll(),
  )
  return rows.map((row: { name: string }) => row.name)
}

export function filterProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase()
  if (!q) return products

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

export async function searchProducts(query: string): Promise<Product[]> {
  const all = await getAllProducts()
  return filterProducts(all, query)
}

export async function ensureCategory(name: string): Promise<void> {
  const trimmed = name.trim()
  if (!trimmed) return
  const db = await getCatalogDatabase()
  await writeInTransaction(db, STORES.categories, (tx) => {
    tx.objectStore(STORES.categories).put({ name: trimmed })
  })
}

export async function putProduct(product: Product): Promise<void> {
  await ensureCategory(product.category)
  const db = await getCatalogDatabase()
  await writeInTransaction(db, STORES.products, (tx) => {
    tx.objectStore(STORES.products).put(product)
  })
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getCatalogDatabase()
  await writeInTransaction(db, STORES.products, (tx) => {
    tx.objectStore(STORES.products).delete(id)
  })
}
