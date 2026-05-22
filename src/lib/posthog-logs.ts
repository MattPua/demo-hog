import type { LogAttributes, LogSeverityLevel, PostHog } from 'posthog-js'
import { captureWhenReady } from '~/lib/posthog-capture'

const SERVICE = 'quill-co-storefront'

function log(
  posthog: PostHog | undefined | null,
  level: LogSeverityLevel,
  body: string,
  attributes?: LogAttributes,
) {
  captureWhenReady(posthog, (client) => {
    client.captureLog({
      body,
      level,
      attributes: {
        service: SERVICE,
        ...attributes,
      },
    })
  })
}

export function logCartItemAdded(
  posthog: PostHog | undefined | null,
  attributes: LogAttributes,
) {
  log(posthog, 'info', 'Cart item added', {
    event_type: 'cart_item_added',
    ...attributes,
  })
}

export function logCartItemRemoved(
  posthog: PostHog | undefined | null,
  attributes: LogAttributes,
) {
  log(posthog, 'info', 'Cart item removed', {
    event_type: 'cart_item_removed',
    ...attributes,
  })
}

export function logPdpViewed(
  posthog: PostHog | undefined | null,
  attributes: LogAttributes,
) {
  log(posthog, 'info', 'Product detail viewed', {
    event_type: 'pdp_viewed',
    ...attributes,
  })
}

export function logProductsSearched(
  posthog: PostHog | undefined | null,
  attributes: LogAttributes,
) {
  log(posthog, 'info', 'Products searched', {
    event_type: 'products_searched',
    ...attributes,
  })
}

export function logCartViewed(
  posthog: PostHog | undefined | null,
  attributes: LogAttributes,
) {
  log(posthog, 'info', 'Cart viewed', {
    event_type: 'cart_viewed',
    ...attributes,
  })
}

export function logCheckoutStarted(
  posthog: PostHog | undefined | null,
  attributes: LogAttributes,
) {
  log(posthog, 'info', 'Checkout started', {
    event_type: 'checkout_started',
    ...attributes,
  })
}

export function logAuthEvent(
  posthog: PostHog | undefined | null,
  body: string,
  attributes: LogAttributes,
) {
  log(posthog, 'info', body, {
    event_type: 'auth',
    ...attributes,
  })
}

export function logCommerceWarning(
  posthog: PostHog | undefined | null,
  body: string,
  attributes: LogAttributes,
) {
  log(posthog, 'warn', body, attributes)
}

export function logCommerceError(
  posthog: PostHog | undefined | null,
  body: string,
  attributes: LogAttributes,
) {
  log(posthog, 'error', body, attributes)
}
