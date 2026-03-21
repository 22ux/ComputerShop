import { LockKeyhole, ShieldCheck, Sparkles, UserCog } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { StoreAuthShell } from '../components/storefront/auth-shell'
import { StoreButton, StoreField, StoreInput } from '../components/storefront/store-ui'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../lib/utils'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({
    email: 'admin@computerstore.local',
    password: 'Admin@123',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  return (
    <StoreAuthShell
      eyebrow="Secure Access"
      title="Sign in to the storefront or admin workspace."
      description="The sign-in flow now follows the same clean hierarchy as the landing page, with stronger spacing, lighter surfaces, and clearer account actions."
      benefits={[
        {
          title: 'Customer storefront access',
          description: 'Save carts, continue checkout, and review your order history from one account.',
        },
        {
          title: 'Admin workspace entry',
          description: 'Use the admin account to manage products, customers, and orders without switching apps.',
        },
        {
          title: 'Seed accounts ready',
          description: 'Demo credentials are preloaded so you can verify the main flows immediately.',
        },
      ]}
      stats={[
        { label: 'Customer', value: '1 account' },
        { label: 'Admin', value: '1 account' },
        { label: 'Flows', value: 'Store + admin' },
      ]}
      form={(
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f8ff] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#008ecc]">
            <Sparkles className="h-3.5 w-3.5" />
            Account login
          </div>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">Welcome back</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">Enter your email and password to continue into the platform.</p>

          {error ? (
            <div className="mt-5 rounded-[22px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
              {error}
            </div>
          ) : null}

          <form
            className="mt-6 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault()
              try {
                setSubmitting(true)
                setError('')
                await login(form)
                navigate(redirectTo)
              } catch (err) {
                setError(getErrorMessage(err))
              } finally {
                setSubmitting(false)
              }
            }}
          >
            <StoreField label="Email address">
              <StoreInput
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </StoreField>

            <StoreField label="Password">
              <StoreInput
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </StoreField>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-[24px] border border-[#dceff7] bg-[#f8fcff] px-4 py-3 text-left transition hover:border-[#a9def2] hover:bg-white"
                onClick={() => setForm({ email: 'admin@computerstore.local', password: 'Admin@123' })}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <UserCog className="h-4 w-4 text-[#008ecc]" />
                  Admin demo
                </div>
                <div className="mt-1 text-xs leading-6 text-slate-500">admin@computerstore.local</div>
              </button>
              <button
                type="button"
                className="rounded-[24px] border border-[#dceff7] bg-[#f8fcff] px-4 py-3 text-left transition hover:border-[#a9def2] hover:bg-white"
                onClick={() => setForm({ email: 'customer@computerstore.local', password: 'Customer@123' })}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-[#008ecc]" />
                  Customer demo
                </div>
                <div className="mt-1 text-xs leading-6 text-slate-500">customer@computerstore.local</div>
              </button>
            </div>

            <StoreButton type="submit" size="lg" className="w-full" disabled={submitting}>
              <LockKeyhole className="h-4 w-4" />
              {submitting ? 'Signing in...' : 'Sign in'}
            </StoreButton>
          </form>
        </div>
      )}
      footerPrompt="Do not have an account yet?"
      footerActionLabel="Create an account"
      footerActionTo="/register"
    />
  )
}
