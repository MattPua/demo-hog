import { Truck } from 'lucide-react'
import { useFeatureFlagEnabled } from '@posthog/react'
import { DEMO_FLAGS } from '~/lib/demo-flags'

export function FreeShippingBanner() {
  const enabled = useFeatureFlagEnabled(DEMO_FLAGS.freeShippingBanner)

  if (enabled !== true) return null

  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm font-medium text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
      <span className="inline-flex items-center justify-center gap-2">
        <Truck className="size-4" />
        Free hedgehog shipping on all orders — demo flag{' '}
        <code className="rounded bg-emerald-100/80 px-1 py-0.5 text-xs dark:bg-emerald-900/60">
          {DEMO_FLAGS.freeShippingBanner}
        </code>
      </span>
    </div>
  )
}
