import type { PostHog, PostHogConfig } from 'posthog-js'

const DEFAULT_INGEST_HOST = 'https://us.i.posthog.com'
const DEFAULT_UI_HOST = 'https://us.posthog.com'

export function getPostHogProjectToken(): string | undefined {
  const token = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
  return token?.trim() || undefined
}

export function getPostHogIngestHost(): string {
  return import.meta.env.VITE_PUBLIC_POSTHOG_HOST?.trim() || DEFAULT_INGEST_HOST
}

/** Shared PostHog browser SDK options (error tracking + session replay). */
export function getPostHogClientOptions(): Partial<PostHogConfig> {
  const ingestHost = getPostHogIngestHost()

  return {
    api_host: ingestHost,
    ui_host: DEFAULT_UI_HOST,
    defaults: '2026-01-30',
    persistence: 'localStorage+cookie',
    person_profiles: 'always',
    autocapture: true,
    // Route enter/leave: PostHogNavigationTracker captures $pageview + $pageleave per navigation.
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
      },
    },
    debug: import.meta.env.DEV,
    on_request_error: (response) => {
      if (import.meta.env.DEV) {
        console.error('[PostHog] Ingest request failed', response)
      }
    },
    logs: {
      serviceName: 'quill-co-storefront',
      environment: import.meta.env.DEV ? 'development' : 'production',
      // Enables the logs extension (required for captureLog / posthog.logger).
      captureConsoleLogs: import.meta.env.DEV,
    },
    loaded: (client) => {
      if (import.meta.env.DEV) {
        const autocaptureOn =
          (client as PostHog).config.autocapture !== false
        console.info(
          '[PostHog] SDK ready — distinct_id:',
          client.get_distinct_id(),
          '→ ingest:',
          ingestHost,
          '— autocapture:',
          autocaptureOn,
          '— page enter/leave:',
          'router ($pageview + $pageleave), tab close ($pageleave)',
          '— logs:',
          (client as PostHog).logger ? 'on' : 'off',
        )
      }
    },
  }
}

export function isPostHogReady(posthog: PostHog | undefined | null): posthog is PostHog {
  return Boolean(posthog && (posthog as PostHog & { __loaded?: boolean }).__loaded)
}
