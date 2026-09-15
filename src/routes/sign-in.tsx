import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  AuthForm,
  authInputClass,
  authLabelClass,
} from '~/components/AuthForm'
import { AppBreadcrumbs } from '~/components/AppBreadcrumbs'
import { PageShell } from '~/components/PageShell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { useAuth } from '~/lib/auth-context'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const { signIn, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate({ to: '/' })
    return null
  }

  async function handleSubmit(form: FormData) {
    setError(null)
    setLoading(true)
    const result = await signIn(
      String(form.get('email') ?? ''),
      String(form.get('password') ?? ''),
    )
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate({ to: '/' })
  }

  return (
    <PageShell className="mx-auto max-w-md py-12">
      <AppBreadcrumbs items={[{ label: 'Sign in' }]} />
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to link your shop activity to a stable user id in PostHog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            title="Sign in"
            description="Demo accounts: demo@quill.co / hedgehog"
            error={error}
            submitLabel={loading ? 'Signing in…' : 'Sign in'}
            disabled={loading}
            onSubmit={handleSubmit}
            footer={
              <>
                No account?{' '}
                <Link to="/sign-up" className="font-medium text-primary hover:underline">
                  Create one
                </Link>
              </>
            }
          >
            <div className="space-y-2">
              <label htmlFor="email" className={authLabelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue="demo@quill.co"
                className={authInputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className={authLabelClass}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                defaultValue="hedgehog"
                className={authInputClass}
              />
            </div>
          </AuthForm>
        </CardContent>
      </Card>
    </PageShell>
  )
}
