import type { FormEvent } from 'react'
import { Button } from '~/components/ui/button'
import {
  emptyProductDraft,
  productToFormState,
  type ProductFormState,
} from '~/lib/product-form'
import type { Product } from '~/lib/products'
import { cn } from '~/lib/utils'

const inputClass =
  'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const labelClass = 'text-sm font-medium'

export function ProductForm({
  initial,
  categories,
  mode,
  existingIds,
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: {
  initial?: Product
  categories: string[]
  mode: 'create' | 'edit'
  existingIds: string[]
  onSubmit: (state: ProductFormState) => void | Promise<void>
  onCancel?: () => void
  submitLabel: string
  disabled?: boolean
}) {
  const defaults = initial
    ? productToFormState(initial)
    : {
        ...productToFormState(emptyProductDraft()),
        category: categories[0] ?? 'Hoodies',
      }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const state: ProductFormState = {
      id: String(data.get('id') ?? ''),
      name: String(data.get('name') ?? ''),
      description: String(data.get('description') ?? ''),
      price: String(data.get('price') ?? ''),
      category: String(data.get('category') ?? ''),
      emoji: String(data.get('emoji') ?? ''),
      tags: String(data.get('tags') ?? ''),
      sizes: String(data.get('sizes') ?? ''),
      featured: data.get('featured') === 'on',
    }
    void onSubmit(state)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'create' ? (
        <div className="space-y-2">
          <label htmlFor="id" className={labelClass}>
            Product ID (slug)
          </label>
          <input
            id="id"
            name="id"
            defaultValue={defaults.id}
            placeholder="auto-generated-from-name"
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to generate from the product name. Must be unique.
          </p>
        </div>
      ) : (
        <input type="hidden" name="id" value={defaults.id} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaults.name}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="price" className={labelClass}>
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={defaults.price}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <input
            id="category"
            name="category"
            list="admin-categories"
            required
            defaultValue={defaults.category}
            className={inputClass}
          />
          <datalist id="admin-categories">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <label htmlFor="emoji" className={labelClass}>
            Emoji
          </label>
          <input
            id="emoji"
            name="emoji"
            defaultValue={defaults.emoji}
            className={cn(inputClass, 'text-xl')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults.description}
          className={cn(inputClass, 'h-auto py-2')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="tags" className={labelClass}>
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            defaultValue={defaults.tags}
            placeholder="hoodie, cozy, bestseller"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="sizes" className={labelClass}>
            Sizes (comma-separated)
          </label>
          <input
            id="sizes"
            name="sizes"
            defaultValue={defaults.sizes}
            placeholder="S, M, L, XL"
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={defaults.featured}
          className="size-4 rounded border-input"
        />
        Featured product
      </label>

      {mode === 'create' && existingIds.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {existingIds.length} product{existingIds.length === 1 ? '' : 's'} in
          catalog
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
