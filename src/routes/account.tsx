import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import {
  AuthForm,
  authInputClass,
  authLabelClass,
} from '~/components/AuthForm'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { PageShell } from '~/components/PageShell'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { useAuth } from '~/lib/auth-context'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

function AccountPage() {
  const navigate = useNavigate()
  const {
    user,
    isAuthenticated,
    isReady,
    distinctId,
    sessionId,
    updateProfile,
    signOut,
  } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isReady) return
    if (!isAuthenticated) {
      navigate({ to: '/sign-in' })
      return
    }
    if (user) setName(user.name)
  }, [isReady, isAuthenticated, user, navigate])

  if (!isReady || !user) {
    return null
  }

  async function handleSubmit(form: FormData) {
    setError(null)
    setSuccess(false)
    setSaving(true)
    const result = await updateProfile(String(form.get('name') ?? ''))
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSuccess(true)
  }

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PageShell className="mx-auto max-w-lg space-y-6 py-8">
      <AppBreadcrumbs items={[{ label: 'Account' }]} />
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground">
          Manage your profile. Changes sync to IndexedDB and PostHog person
          properties.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Signed-in shoppers are linked in PostHog with your email and name via{' '}
            <code>identify</code>. Visitors without an account get a generated
            anonymous ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuthForm
            title="Your details"
            description="Email cannot be changed in this demo."
            error={error}
            submitLabel={saving ? 'Saving…' : 'Save profile'}
            disabled={saving}
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label htmlFor="email" className={authLabelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={user.email}
                readOnly
                className={cn(
                  authInputClass,
                  'cursor-not-allowed bg-muted text-muted-foreground',
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className={authLabelClass}>
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={authInputClass}
              />
            </div>
          </AuthForm>

          {success ? (
            <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
              Profile saved. PostHog person properties were updated.
            </p>
          ) : null}

          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">User id</dt>
              <dd className="font-mono text-xs">{user.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Member since</dt>
              <dd>{joined}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PostHog identity</CardTitle>
          <CardDescription>
            How this browser is identified in your PostHog project while signed
            in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">distinct_id</Badge>
            <code className="break-all font-mono text-xs">{distinctId}</code>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">session_id</Badge>
            <code className="break-all font-mono text-xs">
              {sessionId ?? '—'}
            </code>
          </div>
          <p className="text-muted-foreground">
            Person properties: <code>email</code> = {user.email},{' '}
            <code>name</code> = {user.name}
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/">Back to shop</Link>
        </Button>
        <Button type="button" variant="destructive" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </PageShell>
  )
}
