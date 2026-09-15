import { type Product } from '~/lib/catalog-db'

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

export function hashProductId(id: string) {
  return [...id].reduce((total, character) => total + character.charCodeAt(0), 0)
}

export function getProductHoggieIndex(product: Product) {
  return productHoggieIndexes[product.id] ?? hashProductId(product.id) % hoggieNames.length
}

function getProductLabel(product: Product) {
  return productLabels[product.category as keyof typeof productLabels] ?? 'Item'
}

export function getProductTitle(product: Product) {
  return `${hoggieNames[getProductHoggieIndex(product)]} ${getProductLabel(product)}`
}

export function getProductDescription(product: Product) {
  return `A ${getProductLabel(product).toLowerCase()} with the ${hoggieNames[getProductHoggieIndex(product)]} Hoggie artwork.`
}
