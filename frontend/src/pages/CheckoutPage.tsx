import { CreditCard, MapPin, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  StoreButton,
  StoreEmptyState,
  StoreField,
  StorePageHeader,
  StoreSelect,
  StoreSurface,
  StoreTextarea,
  StoreInput,
} from '../components/storefront/store-ui'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import http from '../lib/http'
import { formatCurrency, getErrorMessage } from '../lib/utils'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, refreshCart, isLoading } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    receiverName: '',
    receiverPhone: '',
    shippingAddress: '',
    note: '',
    paymentMethod: 'Cod',
  })

  useEffect(() => {
    if (!user) {
      return
    }

    setForm((current) => ({
      ...current,
      receiverName: user.fullName,
      receiverPhone: user.phone,
      shippingAddress: user.address,
    }))
  }, [user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      const { data } = await http.post('/orders/checkout', form)
      await refreshCart()
      toast.success(`Order #${data.id} placed successfully.`)
      navigate('/orders')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StorePageHeader
          eyebrow="Checkout"
          title="Preparing your checkout"
          description="We are syncing your cart and saved customer information before the order form is shown."
        />
        <StoreSurface className="p-6 text-sm text-slate-500">
          Loading your cart, pricing summary, and shipping details...
        </StoreSurface>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <StoreEmptyState
        title="No products ready for checkout"
        description="Add items to your cart first, then return here to confirm shipping and payment."
        actionLabel="Browse products"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        eyebrow="Checkout"
        title="Shipping, payment, and final order review"
        description="Confirm who will receive the order, choose a payment method, and review the cart summary before placing the purchase."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <StoreSurface className="p-6 sm:p-8">
          <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-4 rounded-[28px] bg-[#f8fcff] p-5 md:grid-cols-3">
              <CheckoutSignal
                icon={<MapPin className="h-4 w-4" />}
                title="Delivery details"
                description="Pre-filled from your customer profile and editable at checkout."
              />
              <CheckoutSignal
                icon={<CreditCard className="h-4 w-4" />}
                title="Flexible payment"
                description="Choose between cash on delivery or a simulated transfer flow."
              />
              <CheckoutSignal
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Protected order"
                description="Your order history will remain visible in your account after payment."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <StoreField label="Recipient name">
                <StoreInput
                  value={form.receiverName}
                  onChange={(event) => setForm({ ...form, receiverName: event.target.value })}
                  required
                />
              </StoreField>

              <StoreField label="Phone number">
                <StoreInput
                  value={form.receiverPhone}
                  onChange={(event) => setForm({ ...form, receiverPhone: event.target.value })}
                  required
                />
              </StoreField>
            </div>

            <StoreField label="Delivery address">
              <StoreTextarea
                rows={4}
                value={form.shippingAddress}
                onChange={(event) => setForm({ ...form, shippingAddress: event.target.value })}
                required
              />
            </StoreField>

            <div className="grid gap-5 md:grid-cols-2">
              <StoreField label="Payment method">
                <StoreSelect
                  value={form.paymentMethod}
                  onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
                >
                  <option value="Cod">Cash on delivery</option>
                  <option value="BankTransfer">Simulated bank transfer</option>
                </StoreSelect>
              </StoreField>

              <StoreField label="Order note" hint="Optional instructions for delivery or order handling.">
                <StoreInput value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
              </StoreField>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#dceff7] pt-6 sm:flex-row">
              <StoreButton type="submit" size="lg" disabled={submitting} className="sm:min-w-[220px]">
                {submitting ? 'Placing order...' : 'Place order'}
              </StoreButton>
              <StoreButton type="button" variant="secondary" size="lg" onClick={() => navigate('/cart')}>
                Back to cart
              </StoreButton>
            </div>
          </form>
        </StoreSurface>

        <div className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <StoreSurface className="p-6 sm:p-7">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#008ecc]">Order review</div>
            <div className="mt-4 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-[24px] bg-[#f8fcff] p-3">
                  <img src={item.imageUrl} alt={item.productName} className="h-16 w-16 rounded-[20px] object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{item.productName}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{formatCurrency(item.subTotal)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 rounded-[28px] border border-[#dceff7] p-4">
              <SummaryRow label="Items" value={String(cart.itemCount)} />
              <SummaryRow label="Shipping" value="To be confirmed" />
              <SummaryRow label="Payment" value={form.paymentMethod === 'Cod' ? 'Cash on delivery' : 'Bank transfer'} />
              <div className="border-t border-[#dceff7] pt-3">
                <SummaryRow label="Total" value={formatCurrency(cart.totalAmount)} strong />
              </div>
            </div>
          </StoreSurface>

          <StoreSurface className="p-6">
            <div className="space-y-4">
              <CheckoutNote
                icon={<Truck className="h-4 w-4" />}
                title="Fast delivery preparation"
                description="Orders are packaged after stock validation and status updates remain visible in your history."
              />
              <CheckoutNote
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Safe order flow"
                description="You can review the order immediately after placing it from the account area."
              />
            </div>
          </StoreSurface>
        </div>
      </div>
    </div>
  )
}

function CheckoutSignal({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8ff] text-[#008ecc]">{icon}</div>
      <div className="mt-4 font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div>
    </div>
  )
}

function CheckoutNote({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8ff] text-[#008ecc]">{icon}</div>
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={strong ? 'font-semibold text-slate-900' : 'text-sm font-medium text-slate-900'}>{value}</span>
    </div>
  )
}
