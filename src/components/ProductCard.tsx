import { Link } from '@tanstack/react-router'
import { useFeatureFlagEnabled, usePostHog } from '@posthog/react'
import hoggie0 from '@posthog/brand/hoggies/png/70s-dance'
import hoggie1 from '@posthog/brand/hoggies/png/996'
import hoggie2 from '@posthog/brand/hoggies/png/angel'
import hoggie3 from '@posthog/brand/hoggies/png/ape'
import hoggie4 from '@posthog/brand/hoggies/png/art-thief'
import hoggie5 from '@posthog/brand/hoggies/png/back-to-the-future'
import hoggie6 from '@posthog/brand/hoggies/png/ball'
import hoggie7 from '@posthog/brand/hoggies/png/banana'
import hoggie8 from '@posthog/brand/hoggies/png/basketball-coach'
import hoggie9 from '@posthog/brand/hoggies/png/bat'
import hoggie10 from '@posthog/brand/hoggies/png/beaker'
import hoggie11 from '@posthog/brand/hoggies/png/boombox'
import hoggie12 from '@posthog/brand/hoggies/png/business-evolution'
import hoggie13 from '@posthog/brand/hoggies/png/cake'
import hoggie14 from '@posthog/brand/hoggies/png/campfire-cowboy'
import hoggie15 from '@posthog/brand/hoggies/png/card'
import hoggie16 from '@posthog/brand/hoggies/png/caribana'
import hoggie17 from '@posthog/brand/hoggies/png/caveman'
import hoggie18 from '@posthog/brand/hoggies/png/cereal'
import hoggie19 from '@posthog/brand/hoggies/png/chart'
import hoggie20 from '@posthog/brand/hoggies/png/chef'
import hoggie21 from '@posthog/brand/hoggies/png/coconut'
import hoggie22 from '@posthog/brand/hoggies/png/code-bubble'
import hoggie23 from '@posthog/brand/hoggies/png/coding-group'
import hoggie24 from '@posthog/brand/hoggies/png/coffee-cup'
import hoggie25 from '@posthog/brand/hoggies/png/coffee-run'
import hoggie26 from '@posthog/brand/hoggies/png/commuter'
import hoggie27 from '@posthog/brand/hoggies/png/construction-1'
import hoggie28 from '@posthog/brand/hoggies/png/construction-2'
import hoggie29 from '@posthog/brand/hoggies/png/cowboy-lasso'
import hoggie30 from '@posthog/brand/hoggies/png/croissant'
import hoggie31 from '@posthog/brand/hoggies/png/cursor'
import hoggie32 from '@posthog/brand/hoggies/png/dadd-ai-1'
import hoggie33 from '@posthog/brand/hoggies/png/dadd-ai-2'
import hoggie34 from '@posthog/brand/hoggies/png/data-thief'
import hoggie35 from '@posthog/brand/hoggies/png/desk-wizard'
import hoggie36 from '@posthog/brand/hoggies/png/director'
import hoggie37 from '@posthog/brand/hoggies/png/dj'
import hoggie38 from '@posthog/brand/hoggies/png/doc-brown'
import hoggie39 from '@posthog/brand/hoggies/png/doctor-1'
import hoggie40 from '@posthog/brand/hoggies/png/doctor-2'
import hoggie41 from '@posthog/brand/hoggies/png/doll-house'
import hoggie42 from '@posthog/brand/hoggies/png/dr-manhattan'
import hoggie43 from '@posthog/brand/hoggies/png/drake-nah'
import hoggie44 from '@posthog/brand/hoggies/png/drake-yah'
import hoggie45 from '@posthog/brand/hoggies/png/driving-hogzilla'
import hoggie46 from '@posthog/brand/hoggies/png/einstein-group'
import hoggie47 from '@posthog/brand/hoggies/png/einstein'
import hoggie48 from '@posthog/brand/hoggies/png/evel'
import hoggie49 from '@posthog/brand/hoggies/png/experiment'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'
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

const hoggies = [hoggie0, hoggie1, hoggie2, hoggie3, hoggie4, hoggie5, hoggie6, hoggie7, hoggie8, hoggie9, hoggie10, hoggie11, hoggie12, hoggie13, hoggie14, hoggie15, hoggie16, hoggie17, hoggie18, hoggie19, hoggie20, hoggie21, hoggie22, hoggie23, hoggie24, hoggie25, hoggie26, hoggie27, hoggie28, hoggie29, hoggie30, hoggie31, hoggie32, hoggie33, hoggie34, hoggie35, hoggie36, hoggie37, hoggie38, hoggie39, hoggie40, hoggie41, hoggie42, hoggie43, hoggie44, hoggie45, hoggie46, hoggie47, hoggie48, hoggie49]

const hoggieNames = ['70s Dance', '996', 'Angel', 'Ape', 'Art Thief', 'Back to the Future', 'Ball', 'Banana', 'Basketball Coach', 'Bat', 'Beaker', 'Boombox', 'Business Evolution', 'Cake', 'Campfire Cowboy', 'Card', 'Caribana', 'Caveman', 'Cereal', 'Chart', 'Chef', 'Coconut', 'Code Bubble', 'Coding Group', 'Coffee Cup', 'Coffee Run', 'Commuter', 'Construction', 'Construction Crew', 'Cowboy Lasso', 'Croissant', 'Cursor', 'Dadd AI', 'Dadd AI Duo', 'Data Thief', 'Desk Wizard', 'Director', 'DJ', 'Doc Brown', 'Doctor', 'Doctor Duo', 'Doll House', 'Dr Manhattan', 'Drake Nah', 'Drake Yah', 'Driving Hogzilla', 'Einstein Group', 'Einstein', 'Evel', 'Experiment'] as const

const productLabels = {
  Accessories: 'Accessory',
  Hats: 'Hat',
  Hoodies: 'Hoodie',
  Socks: 'Socks',
  'T-Shirts': 'Tee',
} as const

const productHoggieIndexes: Record<string, number> = {
  'classic-hedge-hoodie': 0,
  'spike-back-tee': 1,
  'garden-night-cap': 2,
  'quill-cozy-socks': 3,
  'hedgehog-dad-hat': 4,
  'burrow-zip-hoodie': 5,
  'snout-peek-tee': 6,
  'trail-blazer-socks': 7,
  'hedge-enamel-pin-set': 8,
  'quill-tote': 9,
  'moonlit-forager-hoodie': 10,
  'spiny-scarf': 11,
  'twilight-burrow': 12,
  'moss-lane': 13,
  'pine-needle': 14,
  'hedge-lane': 15,
  'acorn-rest': 16,
  'fern-hollow': 17,
  'root-cellar': 18,
  'leaf-pile': 19,
  'dew-drop': 20,
  'stump-sit': 21,
  'bramble-path': 22,
  'night-snuffle': 23,
  'snuffle-club': 24,
  'quill-society': 25,
  'garden-patrol': 26,
  'snout-squad': 27,
  'leaf-crunch': 28,
  'berry-hunt': 29,
  'moss-walker': 30,
  'trail-scout': 31,
  'dusk-roam': 32,
  'root-friend': 33,
  'pebble-path': 34,
  'hedge-hero': 35,
  'forager-cap': 36,
  'snout-shade': 37,
  'quill-brim': 38,
  'leaf-peak': 39,
  'twilight-visor': 40,
  'burrow-brim': 41,
  'trail-cap': 42,
  'garden-crown': 43,
  'burrow-warmth': 44,
  'trail-tread': 45,
  'snout-step': 46,
  'leaf-liner': 47,
  'night-prowl': 48,
  'quill-grip': 49,
}

const cardThemes = [
  'from-[var(--posthog-lemon-lighter)] via-[var(--posthog-lemon-lighter)] to-[var(--posthog-tangerine-lighter)]',
  'from-[var(--posthog-corn-blue-lighter)] via-[var(--posthog-blue-lighter)] to-[var(--posthog-violet-lighter)]',
  'from-[var(--posthog-teal-lighter)] via-[var(--posthog-green-lighter)] to-[var(--posthog-lime-lighter)]',
] as const

function hashProductId(id: string) {
  return [...id].reduce((total, character) => total + character.charCodeAt(0), 0)
}

export function getProductPresentation(product: Product) {
  const productHash = hashProductId(product.id)
  const hoggieIndex = productHoggieIndexes[product.id] ?? productHash % hoggies.length
  const hoggieName = hoggieNames[hoggieIndex]
  const productLabel = productLabels[product.category as keyof typeof productLabels] ?? 'Item'

  return {
    description: `A ${productLabel.toLowerCase()} with the ${hoggieName} Hoggie artwork.`,
    hoggie: hoggies[hoggieIndex],
    title: `${hoggieName} ${productLabel}`,
    theme: cardThemes[hoggieIndex % cardThemes.length],
  }
}

export function getProductSlug(product: Product) {
  return getProductPresentation(product).title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProductCard({ product }: { product: Product }) {
  const posthog = usePostHog()
  const { addItem, itemCount, subtotal } = useCart()
  const saleMode = useFeatureFlagEnabled(DEMO_FLAGS.spineySaleBadges)
  const presentation = getProductPresentation(product)

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
    <Card className="group flex h-full flex-col overflow-hidden border-0 shadow-sm ring-1 ring-foreground/10 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br p-5 ${presentation.theme}`}>
        <div className="absolute -top-12 -right-8 size-36 rounded-full bg-white/35" />
        <div className="absolute -bottom-16 -left-10 size-44 rounded-full bg-white/25" />
        <Badge className="absolute top-3 left-3 border-0 bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-background/85">
          {product.category}
        </Badge>
        {product.featured ? (
          <span className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-background/85 text-[var(--posthog-tangerine)] shadow-sm backdrop-blur-sm">
            <Sparkles className="size-4" aria-label="Featured" />
          </span>
        ) : null}
        <img
          src={presentation.hoggie}
          alt=""
          className="relative z-10 size-32 object-contain drop-shadow-[0_12px_10px_rgba(29,31,39,0.18)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 sm:size-36"
        />
        <span className="absolute right-3 bottom-3 rounded-full bg-foreground px-3 py-1.5 text-sm font-semibold text-background shadow-sm">
          {formatPrice(product.price)}
        </span>
      </div>
      <CardHeader className="gap-2 pt-5">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-snug">
            {presentation.title}
          </CardTitle>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {saleMode === true ? (
              <Badge className="animate-pulse border-0 bg-[var(--posthog-coral)] text-white hover:bg-[var(--posthog-coral)]">
                SALE
              </Badge>
            ) : null}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {presentation.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <p className="text-sm text-muted-foreground">{product.tags.slice(0, 2).join(' · ')}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 bg-muted/40">
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
          <Button asChild className="flex-1 shadow-none">
            <Link
              to="/products/$productId"
              params={{ productId: getProductSlug(product) }}
              onClick={handleViewProduct}
            >
              See item
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
