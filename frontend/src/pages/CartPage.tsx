import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  StoreButton,
  StoreEmptyState,
  StoreInput,
  StorePageHeader,
  StoreSurface,
} from '../components/storefront/store-ui'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { formatCurrency, getErrorMessage } from '../lib/utils'

export default function CartPage() {
  const { isAuthenticated } = useAuth()
  const { cart, updateItem, removeItem, isLoading } = useCart()

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    try {
      await updateItem(itemId, Math.max(1, quantity))
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleRemove = async (itemId: number) => {
    try {
      await removeItem(itemId)
      toast.success('Item removed from your cart.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  if (!isAuthenticated) {
    return (
      <StoreEmptyState
        title="Sign in to unlock your saved cart"
        description="Your cart is attached to your account so the items stay synced across sessions and devices."
        actionLabel="Sign in"
        actionTo="/login"
      />
    )
  }

  if (!isLoading && cart.items.length === 0) {
    return (
      <StoreEmptyState
        title="Your cart is waiting for products"
        description="Browse the catalog, pick your hardware, and come back here to review everything before checkout."
        actionLabel="Browse products"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        eyebrow="Cart"
        title={`${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'} ready for checkout`}
        description="Review quantities, remove products you no longer want, and move into checkout when the order looks right."
        actions={(
          <StoreButton asChild variant="secondary">
            <Link to="/products">Continue shopping</Link>
          </StoreButton>
        )}
      />

      {isLoading ? (
        <StoreSurface className="p-5 text-sm text-slate-500">
          Syncing your saved cart with the latest product availability...
        </StoreSurface>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <StoreSurface key={item.id} className="overflow-hidden p-4 sm:p-5">
              <div className="grid gap-5 sm:grid-cols-[112px_minmax(0,1fr)]">
                <Link to={`/products/${item.productId}`} className="overflow-hidden rounded-[28px] bg-[#f4fbff]">
                  <img src={item.imageUrl} alt={item.productName} className="h-28 w-full object-cover sm:h-full" />
                </Link>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="inline-flex rounded-full bg-[#eff9fd] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#008ecc]">
                        In cart
                      </div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="mt-3 block font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900 transition hover:text-[#008ecc]"
                      >
                        {item.productName}
                      </Link>
                      <div className="mt-2 text-sm text-slate-500">Available stock: {item.stockQuantity}</div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Unit price</div>
                      <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                        {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-[28px] bg-[#f8fcff] p-4 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-end">
                    <div>
                      <div className="mb-2 text-sm font-semibold text-slate-800">Quantity</div>
                      <div className="flex items-center gap-2">
                        <StoreButton
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-12 w-12 rounded-2xl"
                          onClick={() => void handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </StoreButton>
                        <StoreInput
                          type="number"
                          min={1}
                          max={item.stockQuantity}
                          value={item.quantity}
                          className="text-center"
                          onChange={(event) => void handleQuantityChange(item.id, Number(event.target.value) || 1)}
                        />
                        <StoreButton
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-12 w-12 rounded-2xl"
                          onClick={() => void handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= item.stockQuantity}
                        >
                          <Plus className="h-4 w-4" />
                        </StoreButton>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Subtotal</div>
                      <div className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                        {formatCurrency(item.subTotal)}
                      </div>
                    </div>

                    <StoreButton
                      type="button"
                      variant="ghost"
                      className="justify-start self-start px-0 text-[#ef4444] hover:bg-transparent hover:text-[#dc2626]"
                      onClick={() => void handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </StoreButton>
                  </div>
                </div>
              </div>
            </StoreSurface>
          ))}
        </div>

        <div className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <StoreSurface className="p-6 sm:p-7">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#008ecc]">Order summary</div>
            <div className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">
              {formatCurrency(cart.totalAmount)}
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-500">
              {cart.itemCount} item{cart.itemCount === 1 ? '' : 's'} currently selected and ready to move into checkout.
            </div>

            <div className="mt-6 space-y-3 rounded-[28px] bg-[#f8fcff] p-4">
              <SummaryRow label="Items" value={String(cart.itemCount)} />
              <SummaryRow label="Shipping" value="Calculated at checkout" />
              <SummaryRow label="Payment" value="COD or bank transfer" />
              <div className="border-t border-[#dceff7] pt-3">
                <SummaryRow label="Estimated total" value={formatCurrency(cart.totalAmount)} strong />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <StoreButton asChild size="lg" className="w-full">
                <Link to="/checkout">Proceed to checkout</Link>
              </StoreButton>
              <StoreButton asChild variant="secondary" size="lg" className="w-full">
                <Link to="/products">Add more products</Link>
              </StoreButton>
            </div>
          </StoreSurface>

          <StoreSurface className="p-6">
            <div className="space-y-4">
              <CartPerk
                icon={<Truck className="h-4 w-4" />}
                title="Fast dispatch"
                description="Orders can be prepared quickly once inventory is confirmed."
              />
              <CartPerk
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Protected checkout"
                description="Your cart and order details stay attached to your signed-in account."
              />
              <CartPerk
                icon={<ShoppingBag className="h-4 w-4" />}
                title="Clean review flow"
                description="You can still update quantities here before moving to final confirmation."
              />
            </div>
          </StoreSurface>
        </div>
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

function CartPerk({
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
      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8ff] text-[#008ecc]">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div>
      </div>
    </div>
  )
}
