import { Link } from '@tanstack/react-router'
import { useFeatureFlagEnabled, usePostHog } from '@posthog/react'
import { ArrowRight, Zap } from 'lucide-react'
import { DEMO_FLAGS } from '~/lib/demo-flags'
import { captureAddToCart, captureProductListingClicked } from '~/lib/analytics'
import { useCart } from '~/lib/cart'
import { formatPrice, type Product } from '~/lib/products'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export function ProductCard({ product }: { product: Product }) {
  const posthog = usePostHog()
  const saleMode = useFeatureFlagEnabled(DEMO_FLAGS.spineySaleBadges)
  const { addItem, itemCount, subtotal } = useCart()

  function handleViewProduct() {
    captureProductListingClicked(posthog, product)
  }

  function handleQuickAdd() {
    const size = product.sizes[0]
    addItem(product.id, 1, size)
    captureAddToCart(posthog, product, {
      quantity: 1,
      size,
      cartTotal: subtotal + product.price,
      cartItemCount: itemCount + 1,
      source: 'listing',
    })
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-amber-50 to-emerald-50 text-6xl dark:from-amber-950/40 dark:to-emerald-950/40">
        {product.emoji}
      </div>
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-snug">{product.name}</CardTitle>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {saleMode === true ? (
              <Badge className="animate-pulse bg-rose-600 text-white hover:bg-rose-600">
                SALE
              </Badge>
            ) : null}
            {product.featured ? (
              <Badge variant="secondary">Featured</Badge>
            ) : null}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <p className="text-xl font-semibold">{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex w-full gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={handleQuickAdd}
          >
            <Zap className="size-4" />
            Quick add
          </Button>
          <Button asChild className="flex-1">
            <Link
              to="/products/$productId"
              params={{ productId: product.id }}
              onClick={handleViewProduct}
            >
              View
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
