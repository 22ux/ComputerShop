import { CreditCard, MapPin, PackageCheck, Phone, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  StoreButton,
  StoreEmptyState,
  StoreStatusBadge,
  StoreSurface,
} from '../components/storefront/store-ui'
import http from '../lib/http'
import { formatCurrency, formatDate, getErrorMessage } from '../lib/utils'
import type { OrderDetail, OrderSummary } from '../types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [returningProductId, setReturningProductId] = useState<number | null>(null)

  const loadOrderDetail = async (orderId: number) => {
    try {
      setDetailLoading(true)
      const { data } = await http.get<OrderDetail>(`/orders/my-orders/${orderId}`)
      setSelectedOrder(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDetailLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await http.get<OrderSummary[]>('/orders/my-orders')
      setOrders(data)

      if (data.length > 0) {
        await loadOrderDetail(data[0].id)
      } else {
        setSelectedOrder(null)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => ['Pending', 'Confirmed', 'Shipping'].includes(order.status)).length
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    return {
      totalOrders: orders.length,
      activeOrders,
      totalSpent,
    }
  }, [orders])

  if (!loading && orders.length === 0 && !error) {
    return (
      <StoreEmptyState
        title="No orders have been placed yet"
        description="When you complete a purchase, the full order history and status timeline will appear here."
        actionLabel="Start shopping"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="space-y-6">

      {error ? (
        <StoreSurface className="border-[#fecaca] bg-[#fef2f2] p-5 text-sm text-[#b91c1c]">
          {error}
        </StoreSurface>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total orders" value={String(stats.totalOrders)} description="All purchases attached to this account." />
        <SummaryCard label="Active orders" value={String(stats.activeOrders)} description="Pending, confirmed, or currently shipping." />
        <SummaryCard label="Lifetime spend" value={formatCurrency(stats.totalSpent)} description="Combined value across your order history." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <StoreSurface className="overflow-hidden p-4">
          <div className="mb-3 px-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#008ecc]">Recent orders</div>
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-[24px] bg-[#f8fcff] px-4 py-5 text-sm text-slate-500">Loading your order list...</div>
            ) : (
              orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => void loadOrderDetail(order.id)}
                  className={`w-full rounded-[28px] border px-4 py-4 text-left transition ${
                    selectedOrder?.id === order.id
                      ? 'border-[#8ad4ef] bg-[#f4fbff] shadow-[0_12px_30px_rgba(0,142,204,0.08)]'
                      : 'border-[#dceff7] bg-white hover:border-[#a9def2] hover:bg-[#fbfeff]'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">Order #{order.id}</div>
                      <div className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</div>
                    </div>
                    <StoreStatusBadge status={order.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-500">{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</div>
                    <div className="font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </StoreSurface>

        <StoreSurface className="p-6 sm:p-7">
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#008ecc]">Order details</div>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                    Order #{selectedOrder.id}
                  </h2>
                  <div className="mt-2 text-sm text-slate-500">Placed on {formatDate(selectedOrder.createdAt)}</div>
                </div>
                <StoreStatusBadge status={selectedOrder.status} />
              </div>

              {detailLoading ? (
                <div className="rounded-[24px] bg-[#f8fcff] px-4 py-5 text-sm text-slate-500">Refreshing order details...</div>
              ) : null}

              <div className="grid gap-4 rounded-[28px] bg-[#f8fcff] p-5 md:grid-cols-2 xl:grid-cols-4">
                <DetailTile icon={<PackageCheck className="h-4 w-4" />} label="Recipient" value={selectedOrder.receiverName} />
                <DetailTile icon={<Phone className="h-4 w-4" />} label="Phone" value={selectedOrder.receiverPhone} />
                <DetailTile icon={<MapPin className="h-4 w-4" />} label="Address" value={selectedOrder.shippingAddress} />
                <DetailTile icon={<CreditCard className="h-4 w-4" />} label="Payment" value={selectedOrder.paymentMethod} />
              </div>

              {selectedOrder.note ? (
                <div className="rounded-[24px] border border-[#dceff7] bg-[#fbfeff] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Order note</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{selectedOrder.note}</div>
                </div>
              ) : null}

              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.productId} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between rounded-[28px] border border-[#dceff7] p-4">
                    <div className="flex items-start gap-4 flex-1">
                      <img src={item.imageUrl} alt={item.productName} className="h-20 w-20 rounded-[22px] object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-sm font-semibold text-slate-900">{formatCurrency(item.subTotal)}</div>
                      {selectedOrder.status === 'Completed' && (
                        <StoreButton
                          variant="secondary"
                          size="sm"
                          disabled={returningProductId === item.productId}
                          onClick={async () => {
                            const reason = window.prompt(`Please enter the reason for returning ${item.productName}:`)
                            if (!reason || reason.trim() === '') return
                            
                            try {
                              setReturningProductId(item.productId)
                              await http.post('/returnrequests', {
                                orderId: selectedOrder.id,
                                productId: item.productId,
                                reason: reason
                              })
                              toast.success('Return request submitted successfully.')
                            } catch (err) {
                              toast.error(getErrorMessage(err))
                            } finally {
                              setReturningProductId(null)
                            }
                          }}
                        >
                          {returningProductId === item.productId ? 'Submitting...' : 'Request Return / Warranty'}
                        </StoreButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] border border-[#dceff7] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total amount</div>
                    <div className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </div>
                  </div>

                  {['Pending', 'Confirmed'].includes(selectedOrder.status) ? (
                    <StoreButton
                      type="button"
                      variant="danger"
                      disabled={cancelling}
                      onClick={async () => {
                        try {
                          setCancelling(true)
                          const { data } = await http.patch<OrderDetail>(`/orders/my-orders/${selectedOrder.id}/cancel`)
                          setSelectedOrder(data)
                          toast.success(`Order #${selectedOrder.id} cancelled.`)
                          await loadOrders()
                        } catch (cancelError) {
                          toast.error(getErrorMessage(cancelError))
                        } finally {
                          setCancelling(false)
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      {cancelling ? 'Cancelling...' : 'Cancel order'}
                    </StoreButton>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <StoreEmptyState
              title="Choose an order to inspect"
              description="Select an order from the list to view shipping, payment, and item-level information."
            />
          )}
        </StoreSurface>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <StoreSurface className="p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">{value}</div>
      <div className="mt-2 text-sm leading-7 text-slate-500">{description}</div>
    </StoreSurface>
  )
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#008ecc]">{icon}</div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-7 text-slate-900">{value}</div>
    </div>
  )
}
