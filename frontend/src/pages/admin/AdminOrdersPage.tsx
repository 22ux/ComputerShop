import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CheckCheck, CreditCard, MapPin, PackageCheck, RefreshCw, Search, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { AdminEmptyState } from '../../components/admin/admin-empty-state'
import { AdminLoadingSkeleton } from '../../components/admin/admin-loading-skeleton'
import { AdminPageHeader } from '../../components/admin/admin-page-header'
import { AdminSearchFilterBar } from '../../components/admin/admin-search-filter-bar'
import { AdminStatusBadge } from '../../components/admin/admin-status-badge'
import { AdminSummaryCard } from '../../components/admin/admin-summary-card'
import { DataTable } from '../../components/admin/data-table'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Select } from '../../components/ui/select'
import http from '../../lib/http'
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/utils'
import type { OrderDetail, OrderSummary, PagedResult } from '../../types'

const nextStatuses = ['Pending', 'Confirmed', 'Shipping', 'Completed', 'Cancelled']
const defaultFilters = {
  searchTerm: '',
  status: '',
}
const numberFormatter = new Intl.NumberFormat('en-US')

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadOrderDetail = async (orderId: number) => {
    try {
      setDetailLoading(true)
      const { data } = await http.get<OrderDetail>(`/admin/orders/${orderId}`)
      setSelectedOrder(data)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setDetailLoading(false)
    }
  }

  const loadOrders = async (preferredOrderId?: number, nextFilters = filters) => {
    try {
      setLoading(true)
      setError('')

      const { data } = await http.get<PagedResult<OrderSummary>>('/admin/orders', {
        params: {
          pageSize: 20,
          searchTerm: nextFilters.searchTerm || undefined,
          status: nextFilters.status || undefined,
        },
      })

      setOrders(data.items)
      const nextOrderId =
        data.items.find((item) => item.id === preferredOrderId)?.id ??
        data.items[0]?.id

      if (nextOrderId) {
        await loadOrderDetail(nextOrderId)
      } else {
        setSelectedOrder(null)
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pendingCount = useMemo(
    () => orders.filter((order) => ['Pending', 'Confirmed'].includes(order.status)).length,
    [orders],
  )

  const completedCount = useMemo(
    () => orders.filter((order) => order.status === 'Completed').length,
    [orders],
  )

  const totalValue = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalAmount, 0),
    [orders],
  )

  const activeStatusIndex = nextStatuses.findIndex((status) => status === selectedOrder?.status)

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Order operations"
        title="Track the full order lifecycle and resolve fulfillment faster"
        description="Search across customers, inspect order detail without context switching, and update statuses from a cleaner operations panel."
        actions={<Button variant="outline" onClick={() => void loadOrders(selectedOrder?.id)}>Refresh</Button>}
      />

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-sm text-[#b91c1c]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <AdminSummaryCard
          title="Orders in view"
          value={numberFormatter.format(orders.length)}
          icon={<PackageCheck className="h-5 w-5" />}
          description="Loaded using the current search and status filters."
        />
        <AdminSummaryCard
          title="Needs attention"
          value={numberFormatter.format(pendingCount)}
          icon={<Truck className="h-5 w-5" />}
          description="Pending and confirmed orders waiting on operations."
        />
        <AdminSummaryCard
          title="Completed"
          value={numberFormatter.format(completedCount)}
          icon={<CheckCheck className="h-5 w-5" />}
          description="Orders already closed successfully in this result set."
        />
        <AdminSummaryCard
          title="Gross value"
          value={formatCurrency(totalValue)}
          icon={<CreditCard className="h-5 w-5" />}
          description="Total value of the currently loaded orders."
        />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.2fr)_410px]">
        <div className="space-y-4">
          <AdminSearchFilterBar
            title="Order table"
            description="Search by customer, email, or phone, then narrow by operational status."
            searchValue={filters.searchTerm}
            onSearchChange={(value) => setFilters((current) => ({ ...current, searchTerm: value }))}
            searchPlaceholder="Search orders..."
            filters={(
              <div className="min-w-[180px]">
                <Select
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="">All statuses</option>
                  {nextStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            actions={(
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters(defaultFilters)
                    void loadOrders(undefined, defaultFilters)
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
                <Button onClick={() => void loadOrders(selectedOrder?.id)}>
                  <Search className="h-4 w-4" />
                  Apply
                </Button>
              </>
            )}
          />

          {loading ? (
            <AdminLoadingSkeleton rows={7} />
          ) : (
            <DataTable
              isEmpty={orders.length === 0}
              emptyTitle={filters.searchTerm || filters.status ? 'No orders match these filters' : 'No orders yet'}
              emptyDescription={
                filters.searchTerm || filters.status
                  ? 'Try a broader search query or clear the status filter.'
                  : 'Orders will show up here once customers start checking out.'
              }
              columns={(
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Order</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Payment</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
                </tr>
              )}
              footer={(
                <div className="text-sm text-slate-500">
                  {numberFormatter.format(orders.length)} orders loaded in the current view
                </div>
              )}
            >
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={`transition hover:bg-[#fcfaf8] ${
                    selectedOrder?.id === order.id ? 'bg-[#fff8f2]' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">#{order.id}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{order.customerName || order.receiverName}</div>
                    <div className="mt-1 text-sm text-slate-500">{order.customerEmail || order.receiverPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{order.paymentMethod}</div>
                    <div className="mt-1 text-sm text-slate-500">{order.itemCount} items</div>
                  </td>
                  <td className="px-6 py-4">
                    <AdminStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-6 py-4 text-right">
                    <Button type="button" variant="ghost" onClick={() => void loadOrderDetail(order.id)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>

        <div className="2xl:sticky 2xl:top-6">
          {detailLoading ? (
            <AdminLoadingSkeleton rows={5} />
          ) : selectedOrder ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="warning">Live order detail</Badge>
                    <CardTitle className="mt-3">Order #{selectedOrder.id}</CardTitle>
                    <CardDescription>{formatDate(selectedOrder.createdAt)}</CardDescription>
                  </div>
                  <AdminStatusBadge status={selectedOrder.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid grid-cols-5 gap-2">
                  {nextStatuses.map((status, index) => {
                    const isCancelled = selectedOrder.status === 'Cancelled'
                    const isActive = status === selectedOrder.status
                    const isCompletedStep = !isCancelled && activeStatusIndex >= index

                    return (
                      <div
                        key={status}
                        className={`rounded-2xl px-3 py-2 text-center text-xs font-semibold ${
                          isActive
                            ? 'bg-[#fff1e8] text-[#c2410c]'
                            : isCompletedStep
                              ? 'bg-[#effcf4] text-[#15803d]'
                              : 'bg-[#f8fafc] text-slate-400'
                        }`}
                      >
                        {status}
                      </div>
                    )
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock label="Customer" value={selectedOrder.customerName || selectedOrder.receiverName} />
                  <InfoBlock label="Email" value={selectedOrder.customerEmail || 'Guest checkout'} />
                  <InfoBlock label="Phone" value={selectedOrder.receiverPhone} icon={<Truck className="h-4 w-4" />} />
                  <InfoBlock label="Payment" value={selectedOrder.paymentMethod} icon={<CreditCard className="h-4 w-4" />} />
                  <InfoBlock label="Receiver" value={selectedOrder.receiverName} />
                  <InfoBlock label="Address" value={selectedOrder.shippingAddress} icon={<MapPin className="h-4 w-4" />} />
                </div>

                {selectedOrder.note ? (
                  <div className="rounded-[22px] border border-[#f1ebe5] bg-[#fcfaf8] p-4">
                    <div className="text-sm font-semibold text-slate-900">Customer note</div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{selectedOrder.note}</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-900">Order items</div>
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 rounded-[22px] border border-[#f1ebe5] bg-white px-4 py-3">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#f1ebe5] bg-[#f8fafc]">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900">{item.productName}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{formatCurrency(item.subTotal)}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[22px] border border-[#f1ebe5] bg-[#fcfaf8] p-4">
                  <div className="text-sm font-semibold text-slate-900">Update order status</div>
                  <div className="mt-4 flex flex-col gap-3">
                    <Select
                      value={selectedOrder.status}
                      onChange={(event) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          status: event.target.value,
                        })
                      }
                    >
                      {nextStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>

                    <Button
                      type="button"
                      disabled={saving}
                      onClick={async () => {
                        try {
                          setSaving(true)
                          const { data } = await http.patch<OrderDetail>(
                            `/admin/orders/${selectedOrder.id}/status`,
                            { status: selectedOrder.status },
                          )
                          setSelectedOrder(data)
                          toast.success('Order status updated successfully.')
                          await loadOrders(data.id)
                        } catch (updateError) {
                          toast.error(getErrorMessage(updateError))
                        } finally {
                          setSaving(false)
                        }
                      }}
                    >
                      {saving ? 'Saving...' : 'Save status'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-[22px] border border-[#eadfd5] bg-[#fff7ed] px-4 py-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c2410c]">Order total</div>
                    <div className="mt-1 text-sm text-slate-500">Final amount charged for this order.</div>
                  </div>
                  <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AdminEmptyState
              title="No order selected"
              description="Pick an order from the table to review items, shipping details, and update its status."
            />
          )}
        </div>
      </div>
    </div>
  )
}

function InfoBlock({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-[22px] border border-[#f1ebe5] bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {icon ? icon : null}
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-700">{value}</div>
    </div>
  )
}
