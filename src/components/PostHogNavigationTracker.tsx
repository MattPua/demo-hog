import { usePostHog } from '@posthog/react'
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { captureWhenReady } from '~/lib/posthog-capture'

/**
 * Fires $pageview on route enter and $pageleave on route exit for TanStack Router.
 * SDK capture_pageview is off so we avoid duplicate pageviews with history patching.
 */
export function PostHogNavigationTracker() {
  const posthog = usePostHog()
  const location = useRouterState({
    select: (state) => ({
      href: state.location.href,
      pathname: state.location.pathname,
      searchStr: state.location.searchStr,
    }),
  })
  const previousHrefRef = useRef<string | null>(null)

  useEffect(() => {
    const { href } = location
    const previousHref = previousHrefRef.current

    captureWhenReady(posthog, (client) => {
      if (previousHref !== null && previousHref !== href) {
        client.capture('$pageleave', {
          $current_url: previousHref,
          navigation_type: 'tanstack_router',
        })
      }

      if (previousHref === null || previousHref !== href) {
        client.capture('$pageview', {
          $current_url: href,
          navigation_type: previousHref === null ? 'initial' : 'tanstack_router',
        })
      }
    })

    previousHrefRef.current = href
  }, [posthog, location.href, location.pathname, location.searchStr])

  return null
}
