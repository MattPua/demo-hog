import { ShieldCheck, Sparkles, Undo2 } from 'lucide-react'
import { useFeatureFlagEnabled } from '@posthog/react'
import { DEMO_FLAGS } from '~/lib/demo-flags'

export function TrustBadges() {
  const enabled = useFeatureFlagEnabled(DEMO_FLAGS.trustBadges)

  if (enabled !== true) return null

  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
      <span className="inline-flex items-center gap-1.5 font-medium">
        <ShieldCheck className="size-4" />
        Secure checkout
      </span>
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Undo2 className="size-4" />
        30-day returns
      </span>
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Sparkles className="size-4" />
        Hedgehog-approved
      </span>
      <span className="w-full text-xs text-sky-800/80 dark:text-sky-200/70">
        Flag: <code>{DEMO_FLAGS.trustBadges}</code>
      </span>
    </div>
  )
}
