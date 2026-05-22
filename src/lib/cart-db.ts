import { getCatalogDatabase } from '~/lib/catalog-db'
import { readFromStore, writeInTransaction } from '~/lib/idb'

export type CartLine = {
  productId: string
  quantity: number
  size?: string
}

const CART_STORE = 'cart_lines'

function cartLineKey(productId: string, size?: string) {
  return `${productId}::${size ?? ''}`
}

type StoredCartLine = CartLine & { key: string }

export async function getCartLines(): Promise<CartLine[]> {
  const db = await getCatalogDatabase()
  const rows = await readFromStore<StoredCartLine[]>(db, CART_STORE, (store) =>
    store.getAll(),
  )
  return rows.map(({ productId, quantity, size }) => ({
    productId,
    quantity,
    size,
  }))
}

export async function saveCartLines(lines: CartLine[]): Promise<void> {
  const db = await getCatalogDatabase()
  await writeInTransaction(db, CART_STORE, (tx) => {
    const store = tx.objectStore(CART_STORE)
    store.clear()
    for (const line of lines) {
      const row: StoredCartLine = {
        ...line,
        key: cartLineKey(line.productId, line.size),
      }
      store.put(row)
    }
  })
}
