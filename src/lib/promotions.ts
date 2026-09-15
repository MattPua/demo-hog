export const PROMO_CODE = 'HEDGE10'

export function calculatePromoDiscount(
  subtotal: number,
  code: string | null,
): number {
  if (code?.trim().toUpperCase() !== PROMO_CODE) return 0
  return Math.round(subtotal * 0.1 * 100) / 100
}
