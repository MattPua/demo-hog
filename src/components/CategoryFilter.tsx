import { cn } from '~/lib/utils'

export function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: string[]
  value: string | null
  onChange: (category: string | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <CategoryPill
        label="All"
        active={value === null}
        onClick={() => onChange(null)}
      />
      {categories.map((cat) => (
        <CategoryPill
          key={cat}
          label={cat}
          active={value === cat}
          onClick={() => onChange(cat)}
        />
      ))}
    </div>
  )
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background hover:bg-muted',
      )}
    >
      {label}
    </button>
  )
}
