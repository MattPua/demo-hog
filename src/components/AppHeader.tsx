import { Link, useMatchRoute } from '@tanstack/react-router'
import { FreeShippingBanner } from '~/components/demo/FreeShippingBanner'
import { ThemeToggle } from '~/components/ThemeToggle'
import type { LucideIcon } from 'lucide-react'
import {
  Home,
  LogIn,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { useAuth } from '~/lib/auth-context'
import { useCart } from '~/lib/cart'
import { cn } from '~/lib/utils'

const navItems = [
  { to: '/', label: 'Shop', icon: Home, exact: true },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/admin', label: 'Admin', icon: Settings },
] as const

function NavItem({
  to,
  label,
  icon: Icon,
  exact,
}: {
  to: string
  label: string
  icon: LucideIcon
  exact?: boolean
}) {
  const matchRoute = useMatchRoute()
  const isActive = Boolean(matchRoute({ to, fuzzy: !exact }))

  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      size="sm"
      className={cn('shrink-0 gap-1.5', isActive && 'font-medium')}
    >
      <Link to={to}>
        <Icon className="size-3.5" />
        {label}
      </Link>
    </Button>
  )
}

function CartNavItem() {
  const matchRoute = useMatchRoute()
  const { itemCount, clearCart } = useCart()
  const isActive = Boolean(matchRoute({ to: '/cart', fuzzy: true }))

  return (
    <div
      className={cn(
        'flex shrink-0 items-center rounded-md',
        isActive && 'bg-secondary',
      )}
    >
      <Button
        asChild
        variant={isActive ? 'secondary' : 'ghost'}
        size="sm"
        className={cn(
          'gap-1.5 rounded-r-none',
          isActive && 'bg-transparent font-medium shadow-none',
        )}
      >
        <Link to="/cart">
          <ShoppingCart className="size-3.5" />
          Cart
          {itemCount > 0 ? (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {itemCount}
            </span>
          ) : null}
        </Link>
      </Button>
      {itemCount > 0 ? (
        <Button
          type="button"
          variant={isActive ? 'secondary' : 'ghost'}
          size="icon"
          className={cn(
            'size-8 shrink-0 rounded-l-none border-l border-border/60',
            isActive && 'bg-transparent shadow-none',
          )}
          aria-label="Clear cart"
          title="Clear cart"
          onClick={clearCart}
        >
          <Trash2 className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}

export function AppHeader() {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <FreeShippingBanner />
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xl text-primary-foreground">
            🦔
          </span>
          <span className="hidden sm:inline">Quill & Co.</span>
        </Link>

        <Badge variant="secondary" className="hidden gap-1 md:inline-flex">
          <Package className="size-3" />
          Demo store
        </Badge>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <nav className="flex flex-1 items-center justify-end gap-1">
          {navItems.map((item) =>
            item.to === '/cart' ? (
              <CartNavItem key={item.to} />
            ) : (
              <NavItem key={item.to} {...item} />
            ),
          )}

          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
                <Link to="/account">
                  <User className="size-3.5" />
                  {user.name}
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={signOut}
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/sign-in">
                <LogIn className="size-3.5" />
                Sign in
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
