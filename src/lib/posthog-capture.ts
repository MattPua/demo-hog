import type { PostHog } from 'posthog-js'
import { isPostHogReady } from '~/lib/posthog-client'

/**
 * Run a capture after the browser SDK has finished init.
 */
export function captureWhenReady(
  posthog: PostHog | undefined | null,
  capture: (client: PostHog) => void,
): void {
  if (!posthog) {
    if (import.meta.env.DEV) {
      console.warn('[PostHog] Skipped capture — SDK not available')
    }
    return
  }

  const run = () => capture(posthog)

  if (isPostHogReady(posthog)) {
    run()
    return
  }

  let attempts = 0
  const intervalId = window.setInterval(() => {
    attempts += 1
    if (isPostHogReady(posthog)) {
      window.clearInterval(intervalId)
      run()
    } else if (attempts > 100) {
      window.clearInterval(intervalId)
      if (import.meta.env.DEV) {
        console.warn('[PostHog] Timed out waiting for SDK before capture — trying anyway')
      }
      run()
    }
  }, 50)
}

export function whenPostHogReady(
  posthog: PostHog | undefined | null,
  callback: (client: PostHog) => void,
): void {
  captureWhenReady(posthog, callback)
}
