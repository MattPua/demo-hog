export type { Product } from '~/lib/catalog-db'
export { filterProducts } from '~/lib/catalog-db'

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
