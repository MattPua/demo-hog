import { useEffect } from 'react'
import { roundHogFontFaceCss } from '@posthog/brand/fonts/css'

export function BrandFonts() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = roundHogFontFaceCss
    document.head.appendChild(style)

    return () => style.remove()
  }, [])

  return null
}
