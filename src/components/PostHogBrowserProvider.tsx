import { PostHogProvider } from '@posthog/react'
import type { PostHogConfig } from 'posthog-js'
import { useEffect, useState, type ReactNode } from 'react'

type PostHogBrowserProviderProps = {
  apiKey: string
  options: Partial<PostHogConfig>
  children: ReactNode
}

/** Avoid running posthog.init during SSR; init only after the browser mounts. */
export function PostHogBrowserProvider({
  apiKey,
  options,
  children,
}: PostHogBrowserProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <PostHogProvider apiKey={apiKey} options={options}>
      {children}
    </PostHogProvider>
  )
}
