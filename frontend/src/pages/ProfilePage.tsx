import { BadgeCheck, KeyRound, Mail, MapPin, Phone, ShieldCheck, UserCircle2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  StoreButton,
  StoreField,
  StoreInput,
  StoreSurface,
  StoreTextarea,
  StoreStatusBadge,
} from '../components/storefront/store-ui'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, getErrorMessage } from '../lib/utils'

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth()
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    address: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    setProfileForm({
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
    })
  }, [user])

  if (!user) {
    return (
      <StoreSurface className="p-6 text-sm text-slate-500">
        Loading your account profile...
      </StoreSurface>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <ProfileMeta
          icon={<UserCircle2 className="h-4 w-4" />}
          label="Full name"
          value={user.fullName}
        />
        <ProfileMeta
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={user.email}
        />
        <ProfileMeta
          icon={<BadgeCheck className="h-4 w-4" />}
          label="Role"
          value={user.role}
        />
        <ProfileMeta
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Member since"
          value={formatDate(user.createdAt)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StoreSurface className="p-6 sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#008ecc]">Profile details</div>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">
            Keep shipping information up to date
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            These details can be reused during checkout, so keeping them accurate reduces friction when placing future orders.
          </p>

          <form
            className="mt-6 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault()
              try {
                setSavingProfile(true)
                await updateProfile(profileForm)
                toast.success('Profile updated successfully.')
              } catch (error) {
                toast.error(getErrorMessage(error))
              } finally {
                setSavingProfile(false)
              }
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <StoreField label="Full name">
                <StoreInput
                  value={profileForm.fullName}
                  onChange={(event) => setProfileForm({ ...profileForm, fullName: event.target.value })}
                  required
                />
              </StoreField>

              <StoreField label="Phone number">
                <StoreInput
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
                  required
                />
              </StoreField>
            </div>

            <StoreField label="Address">
              <StoreTextarea
                rows={5}
                value={profileForm.address}
                onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })}
                required
              />
            </StoreField>

            <StoreButton type="submit" size="lg" disabled={savingProfile}>
              {savingProfile ? 'Saving changes...' : 'Save profile changes'}
            </StoreButton>
          </form>
        </StoreSurface>

        <div className="space-y-4">
          <StoreSurface className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#008ecc]">Account status</div>
                <div className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                  {user.email}
                </div>
              </div>
              <StoreStatusBadge status={user.isActive ? 'Active' : 'Locked'} />
            </div>

            <div className="mt-6 space-y-4 rounded-[28px] bg-[#f8fcff] p-4">
              <AccountLine icon={<Phone className="h-4 w-4" />} text={user.phone || 'No phone number added'} />
              <AccountLine icon={<MapPin className="h-4 w-4" />} text={user.address || 'No address added'} />
              <AccountLine icon={<BadgeCheck className="h-4 w-4" />} text={`Role: ${user.role}`} />
            </div>
          </StoreSurface>

          <StoreSurface className="p-6 sm:p-7">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#008ecc]">Password security</div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              Change your password
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Update your password to keep access secure for both shopping and account history.
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault()
                try {
                  setSavingPassword(true)
                  await changePassword(passwordForm)
                  setPasswordForm({ currentPassword: '', newPassword: '' })
                  toast.success('Password updated successfully.')
                } catch (error) {
                  toast.error(getErrorMessage(error))
                } finally {
                  setSavingPassword(false)
                }
              }}
            >
              <StoreField label="Current password">
                <StoreInput
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                  required
                />
              </StoreField>

              <StoreField label="New password">
                <StoreInput
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  required
                />
              </StoreField>

              <StoreButton type="submit" size="lg" disabled={savingPassword}>
                <KeyRound className="h-4 w-4" />
                {savingPassword ? 'Updating password...' : 'Update password'}
              </StoreButton>
            </form>
          </StoreSurface>
        </div>
      </div>
    </div>
  )
}

function ProfileMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <StoreSurface className="p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8ff] text-[#008ecc]">{icon}</div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-7 text-slate-900">{value}</div>
    </StoreSurface>
  )
}

function AccountLine({
  icon,
  text,
}: {
  icon: ReactNode
  text: string
}) {
  return (
    <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#008ecc]">{icon}</div>
      <span>{text}</span>
    </div>
  )
}
