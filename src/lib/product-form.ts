import type { Product } from '~/lib/catalog-db'

export function slugifyId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseListField(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function formatListField(values: string[]): string {
  return values.join(', ')
}

export function emptyProductDraft(): Product {
  return {
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'Hoodies',
    emoji: '🦔',
    tags: [],
    sizes: [],
    featured: false,
  }
}

export type ProductFormState = {
  id: string
  name: string
  description: string
  price: string
  category: string
  emoji: string
  tags: string
  sizes: string
  featured: boolean
}

export function productToFormState(product: Product): ProductFormState {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: String(product.price),
    category: product.category,
    emoji: product.emoji,
    tags: formatListField(product.tags),
    sizes: formatListField(product.sizes),
    featured: product.featured,
  }
}

export function formStateToProduct(
  state: ProductFormState,
  options?: { preserveId?: boolean },
): Product | { error: string } {
  const id = options?.preserveId
    ? state.id.trim()
    : slugifyId(state.id || state.name)

  if (!id) {
    return { error: 'Product ID is required (or enter a name to auto-generate one).' }
  }

  const name = state.name.trim()
  if (!name) {
    return { error: 'Name is required.' }
  }

  const price = Number.parseFloat(state.price)
  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Enter a valid price.' }
  }

  const category = state.category.trim()
  if (!category) {
    return { error: 'Category is required.' }
  }

  return {
    id,
    name,
    description: state.description.trim(),
    price,
    category,
    emoji: state.emoji.trim() || '🦔',
    tags: parseListField(state.tags),
    sizes: parseListField(state.sizes),
    featured: state.featured,
  }
}
