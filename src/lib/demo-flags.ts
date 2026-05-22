/** PostHog feature flag & experiment keys for Quill & Co. demos. */
export const DEMO_FLAGS = {
  freeShippingBanner: 'quill-free-shipping-banner',
  spineySaleBadges: 'quill-spiney-sale-badges',
  trustBadges: 'quill-trust-badges',
  cartCelebration: 'quill-cart-celebration',
  homeGridLayout: 'quill-home-grid-layout',
  pdpCtaCopy: 'quill-pdp-cta-copy',
} as const

export const HOME_GRID_VARIANTS = {
  control: 'control',
  spacious: 'spacious',
} as const

export const PDP_CTA_VARIANTS = {
  control: 'control',
  friendly: 'friendly',
} as const
