import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { Separator } from '~/components/ui/separator'

const shopLinks = [
  { to: '/', label: 'Shop' },
  { to: '/cart', label: 'Cart' },
  { to: '/order-summary', label: 'Orders' },
] as const

const accountLinks = [
  { to: '/sign-in', label: 'Sign in' },
  { to: '/sign-up', label: 'Create account' },
  { to: '/account', label: 'Account' },
] as const

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xl text-primary-foreground">
                🦔
              </span>
              Quill & Co.
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Hedgehog apparel demo storefront for PostHog product analytics,
              session replay, and error tracking.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Shop</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/admin"
                  className="transition-colors hover:text-foreground"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Account</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {accountLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Built with</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://posthog.com/docs/libraries/js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                >
                  PostHog JS
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://tanstack.com/router"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                >
                  TanStack Router
                  <ExternalLink className="size-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Quill & Co. Demo. Not a real store.</p>
          <p>Demo credentials: demo@quill.co / hedgehog</p>
        </div>
      </div>
    </footer>
  )
}
