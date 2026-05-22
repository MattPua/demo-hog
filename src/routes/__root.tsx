/// <reference types="vite/client" />
import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { PostHogErrorBoundary } from '@posthog/react'
import { PostHogBrowserProvider } from '~/components/PostHogBrowserProvider'
import { PostHogNavigationTracker } from '~/components/PostHogNavigationTracker'
import * as React from 'react'
import { AppFooter } from '~/components/AppFooter'
import { AppHeader } from '~/components/AppHeader'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { PostHogErrorFallback } from '~/components/PostHogErrorFallback'
import { RootNotFound } from '~/components/NotFound'
import { CatalogGate } from '~/components/CatalogGate'
import { CartProvider } from '~/lib/cart'
import { CatalogProvider } from '~/lib/catalog-context'
import {
  getPostHogClientOptions,
  getPostHogProjectToken,
} from '~/lib/posthog-client'
import { AuthProvider } from '~/lib/auth-context'
import { ThemeProvider } from '~/lib/theme'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Quill & Co. | Hedgehog Apparel Demo Store',
        description:
          'Demo storefront for hedgehog-themed apparel with PostHog product analytics.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
    scripts: [
      {
        src: '/customScript.js',
        type: 'text/javascript',
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: RootNotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const posthogApiKey = getPostHogProjectToken()
  const posthogOptions = React.useMemo(() => getPostHogClientOptions(), [])

  React.useEffect(() => {
    if (posthogApiKey || !import.meta.env.DEV) return
    console.error(
      '[PostHog] Missing VITE_PUBLIC_POSTHOG_PROJECT_TOKEN in .env — events will not be sent.',
    )
  }, [posthogApiKey])

  const app = (
    <>
          <PostHogErrorBoundary
            fallback={PostHogErrorFallback}
            additionalProperties={{ source: 'react_error_boundary' }}
          >
            <PostHogNavigationTracker />
            <AuthProvider>
              <ThemeProvider>
                <CatalogProvider>
                  <CartProvider>
                    <div className="flex min-h-screen flex-col">
                      <AppHeader />
                      <div className="flex min-h-0 flex-1 flex-col">
                        <CatalogGate>{children}</CatalogGate>
                      </div>
                      <AppFooter />
                    </div>
                  </CartProvider>
                </CatalogProvider>
              </ThemeProvider>
            </AuthProvider>
      </PostHogErrorBoundary>
    </>
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {posthogApiKey ? (
          <PostHogBrowserProvider apiKey={posthogApiKey} options={posthogOptions}>
            {app}
          </PostHogBrowserProvider>
        ) : (
          app
        )}
        <Scripts />
      </body>
    </html>
  )
}
