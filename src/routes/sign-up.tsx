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

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate({ to: '/' })
    return null
  }

  async function handleSubmit(form: FormData) {
    setError(null)
    setLoading(true)
    const result = await signUp(
      String(form.get('email') ?? ''),
      String(form.get('password') ?? ''),
      String(form.get('name') ?? ''),
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
      <AppBreadcrumbs items={[{ label: 'Create account' }]} />
      <Card>
        <CardHeader>
          <CardTitle>Join Quill & Co.</CardTitle>
          <CardDescription>
            Accounts are stored locally in IndexedDB for this demo. PostHog will
            use your user id as distinct_id.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            title="Create account"
            description="Passwords are not encrypted — demo only."
            error={error}
            submitLabel={loading ? 'Creating account…' : 'Create account'}
            disabled={loading}
            onSubmit={handleSubmit}
            footer={
              <>
                Already have an account?{' '}
                <Link to="/sign-in" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </>
            }
          >
            <div className="space-y-2">
              <label htmlFor="name" className={authLabelClass}>
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className={authInputClass}
              />
            </div>
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
                minLength={4}
                autoComplete="new-password"
                className={authInputClass}
              />
            </div>
          </AuthForm>
        </CardContent>
      </Card>
    </PageShell>
  )
}
