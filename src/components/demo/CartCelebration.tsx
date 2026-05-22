import { useFeatureFlagEnabled } from '@posthog/react'
import { DEMO_FLAGS } from '~/lib/demo-flags'

export function CartCelebration() {
  const enabled = useFeatureFlagEnabled(DEMO_FLAGS.cartCelebration)

  if (enabled !== true) return null

  return (
    <p className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-center text-sm font-medium text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-100">
      🎉 You unlocked the VIP forager cart experience (
      <code className="text-xs">{DEMO_FLAGS.cartCelebration}</code>)
    </p>
  )
}
