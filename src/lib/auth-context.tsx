import { usePostHog } from '@posthog/react'
import type { PostHog } from 'posthog-js'
import { captureWhenReady, whenPostHogReady } from '~/lib/posthog-capture'
import { logAuthEvent } from '~/lib/posthog-logs'
import { isPostHogReady } from '~/lib/posthog-client'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUser,
  ensureAuthSeeded,
  getUserById,
  updateUserProfile,
  verifyUser,
  type User,
} from '~/lib/auth-db'

const SESSION_KEY = 'quill-co-session'
const ANONYMOUS_DISTINCT_ID_KEY = 'quill-co-posthog-anonymous-id'

type Session = {
  userId: string
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isReady: boolean
  distinctId: string | null
  sessionId: string | null
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string }>
  signOut: () => void
  updateProfile: (name: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    return parsed?.userId ? parsed : null
  } catch {
    return null
  }
}

function writeSession(session: Session | null) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    /* ignore */
  }
}

function getOrCreateAnonymousDistinctId(): string {
  if (typeof window === 'undefined') return `anon_${crypto.randomUUID()}`
  try {
    let id = localStorage.getItem(ANONYMOUS_DISTINCT_ID_KEY)
    if (!id) {
      id = `anon_${crypto.randomUUID()}`
      localStorage.setItem(ANONYMOUS_DISTINCT_ID_KEY, id)
    }
    return id
  } catch {
    return `anon_${crypto.randomUUID()}`
  }
}

function identifyUser(posthog: PostHog, user: User) {
  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
    created_at: user.createdAt,
  })
  posthog.register({
    app: 'quill-co-storefront',
    visitor_type: 'authenticated',
  })
}

function bootstrapAnonymous(posthog: PostHog) {
  const anonymousId = getOrCreateAnonymousDistinctId()

  posthog.identify(anonymousId, { is_anonymous: true })
  posthog.register({
    app: 'quill-co-storefront',
    visitor_type: 'anonymous',
  })

  const distinctId = posthog.get_distinct_id()

  if (!posthog.get_property('visitor_bootstrapped')) {
    posthog.register_once({ visitor_bootstrapped: true })
    captureWhenReady(posthog, (client) => {
      client.capture('anonymous_visitor_registered', {
        session_id: client.get_session_id(),
      })
    })
    logAuthEvent(posthog, 'Anonymous visitor registered', {
      action: 'anonymous_visitor_registered',
    })
  }

  return {
    distinctId,
    sessionId: posthog.get_session_id() ?? null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const posthog = usePostHog()
  const [user, setUser] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [distinctId, setDistinctId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const applyPostHogIdentity = useCallback(
    (nextUser: User | null) => {
      if (!isPostHogReady(posthog)) return

      if (nextUser) {
        identifyUser(posthog, nextUser)
        setDistinctId(posthog.get_distinct_id())
        setSessionId(posthog.get_session_id() ?? null)
        return
      }

      posthog.reset()
      const ids = bootstrapAnonymous(posthog)
      setDistinctId(ids.distinctId)
      setSessionId(ids.sessionId)
    },
    [posthog],
  )

  useEffect(() => {
    if (!posthog) return

    let cancelled = false

    whenPostHogReady(posthog, () => {
      if (cancelled) return

      void (async () => {
        await ensureAuthSeeded()
        const session = readSession()
        let loaded: User | null = null

        if (session?.userId) {
          loaded = (await getUserById(session.userId)) ?? null
          if (!loaded) writeSession(null)
        }

        if (cancelled) return

        setUser(loaded)
        applyPostHogIdentity(loaded)
        setIsReady(true)
      })()
    })

    return () => {
      cancelled = true
    }
  }, [posthog, applyPostHogIdentity])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const match = await verifyUser(email, password)
      if (!match) {
        return { error: 'Invalid email or password.' }
      }

      writeSession({ userId: match.id })
      setUser(match)
      if (isPostHogReady(posthog)) {
        identifyUser(posthog, match)
        captureWhenReady(posthog, (client) => {
          client.capture('user_signed_in', { user_id: match.id })
        })
        logAuthEvent(posthog, 'User signed in', {
          action: 'user_signed_in',
          user_id: match.id,
        })
        setDistinctId(posthog.get_distinct_id())
        setSessionId(posthog.get_session_id() ?? null)
      }
      return {}
    },
    [posthog],
  )

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      if (!email.trim() || !password) {
        return { error: 'Email and password are required.' }
      }
      if (password.length < 4) {
        return { error: 'Password must be at least 4 characters (demo only).' }
      }

      try {
        const created = await createUser({ email, password, name })
        writeSession({ userId: created.id })
        setUser(created)
        if (isPostHogReady(posthog)) {
          identifyUser(posthog, created)
          captureWhenReady(posthog, (client) => {
            client.capture('user_signed_up', { user_id: created.id })
          })
          logAuthEvent(posthog, 'User signed up', {
            action: 'user_signed_up',
            user_id: created.id,
          })
          setDistinctId(posthog.get_distinct_id())
          setSessionId(posthog.get_session_id() ?? null)
        }
        return {}
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : 'Could not create account.',
        }
      }
    },
    [posthog],
  )

  const signOut = useCallback(() => {
    writeSession(null)
    setUser(null)
    if (isPostHogReady(posthog)) {
      captureWhenReady(posthog, (client) => {
        client.capture('user_signed_out')
      })
      logAuthEvent(posthog, 'User signed out', { action: 'user_signed_out' })
      posthog.reset()
      const ids = bootstrapAnonymous(posthog)
      setDistinctId(ids.distinctId)
      setSessionId(ids.sessionId)
    }
  }, [posthog])

  const updateProfile = useCallback(
    async (name: string) => {
      if (!user) {
        return { error: 'You must be signed in to update your profile.' }
      }

      try {
        const updated = await updateUserProfile(user.id, { name })
        setUser(updated)
        if (isPostHogReady(posthog)) {
          identifyUser(posthog, updated)
          captureWhenReady(posthog, (client) => {
            client.capture('profile_updated', {
              user_id: updated.id,
              name: updated.name,
            })
          })
          logAuthEvent(posthog, 'Profile updated', {
            action: 'profile_updated',
            user_id: updated.id,
          })
        }
        return {}
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : 'Could not update profile.',
        }
      }
    },
    [user, posthog],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user != null,
      isReady,
      distinctId,
      sessionId,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [
      user,
      isReady,
      distinctId,
      sessionId,
      signIn,
      signUp,
      signOut,
      updateProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
