import { PostHog } from 'posthog-node'
import {
  getPostHogIngestHost,
  getPostHogProjectToken,
} from '~/lib/posthog-client'

let posthogClient: PostHog | null = null

export function getPostHogClient() {
  const token = getPostHogProjectToken()
  if (!token) {
    throw new Error('Missing VITE_PUBLIC_POSTHOG_PROJECT_TOKEN for server capture')
  }

  if (!posthogClient) {
    posthogClient = new PostHog(token, {
      host: getPostHogIngestHost(),
      flushAt: 1,
      flushInterval: 0,
      enableExceptionAutocapture: true,
    })
  }
  return posthogClient
}
