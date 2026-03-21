import { BadgeCheck, Sparkles, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StoreAuthShell } from '../components/storefront/auth-shell'
import { StoreButton, StoreField, StoreInput, StoreTextarea } from '../components/storefront/store-ui'
import { useAuth } from '../contexts/AuthContext'
import { getErrorMessage } from '../lib/utils'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  return (
    <StoreAuthShell
      eyebrow="Customer Onboarding"
      title="Create an account to save carts and track every order."
      description="Registration now follows the same premium storefront rhythm as the landing page, so the onboarding flow feels like part of a real ecommerce product."
      benefits={[
        {
          title: 'Saved carts across sessions',
          description: 'Start browsing on one device and continue later without losing selected products.',
        },
        {
          title: 'Clear order history',
          description: 'Every purchase remains visible with status updates and product-level detail.',
        },
        {
          title: 'Faster future checkout',
          description: 'Profile details can pre-fill delivery information to reduce friction later.',
        },
      ]}
      stats={[
        { label: 'Account', value: 'Customer' },
        { label: 'Checkout', value: 'Pre-fill ready' },
        { label: 'History', value: 'Tracked' },
      ]}
      form={(
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f8ff] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#008ecc]">
            <Sparkles className="h-3.5 w-3.5" />
            New account
          </div>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">Create your account</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">Set up a customer account and start using the full shopping flow.</p>

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
                await register(form)
                navigate('/')
              } catch (err) {
                setError(getErrorMessage(err))
              } finally {
                setSubmitting(false)
              }
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <StoreField label="Full name">
                <StoreInput
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                  required
                />
              </StoreField>
              <StoreField label="Phone number">
                <StoreInput
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  required
                />
              </StoreField>
            </div>

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

            <StoreField label="Address">
              <StoreTextarea
                rows={4}
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                required
              />
            </StoreField>

            <div className="rounded-[24px] border border-[#dceff7] bg-[#f8fcff] px-4 py-4 text-sm leading-7 text-slate-500">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <BadgeCheck className="h-4 w-4 text-[#008ecc]" />
                Account benefits
              </div>
              <div className="mt-2">Your profile details can be reused for checkout, order history, and future account updates.</div>
            </div>

            <StoreButton type="submit" size="lg" className="w-full" disabled={submitting}>
              <UserPlus className="h-4 w-4" />
              {submitting ? 'Creating account...' : 'Create account'}
            </StoreButton>
          </form>
        </div>
      )}
      footerPrompt="Already have an account?"
      footerActionLabel="Sign in"
      footerActionTo="/login"
    />
  )
}
