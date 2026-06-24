import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Crown, Mail, Phone, ShieldBan, ShieldCheck, Users, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { AdminEmptyState } from '../../components/admin/admin-empty-state'
import { AdminLoadingSkeleton } from '../../components/admin/admin-loading-skeleton'
import { AdminPageHeader } from '../../components/admin/admin-page-header'
import { AdminSearchFilterBar } from '../../components/admin/admin-search-filter-bar'
import { AdminSummaryCard } from '../../components/admin/admin-summary-card'
import { DataTable } from '../../components/admin/data-table'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Select } from '../../components/ui/select'
import http from '../../lib/http'
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/utils'
import type { CustomerSummary, UserDetail } from '../../types'

const numberFormatter = new Intl.NumberFormat('en-US')

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all')
  const [error, setError] = useState('')

  const loadCustomerDetail = async (customerId: number) => {
    try {
      setDetailLoading(true)
      const { data } = await http.get<UserDetail>(`/admin/users/${customerId}`)
      setSelectedCustomer(data)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setDetailLoading(false)
    }
  }

  const loadCustomers = async (preferredCustomerId?: number) => {
    try {
      setLoading(true)
      setError('')
      const { data } = await http.get<CustomerSummary[]>('/admin/users')
      setCustomers(data)

      const nextId =
        data.find((customer) => customer.id === preferredCustomerId)?.id ??
        data[0]?.id

      if (nextId) {
        await loadCustomerDetail(nextId)
      } else {
        setSelectedCustomer(null)
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch = [
        customer.fullName,
        customer.email,
        customer.phone,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.trim().toLowerCase())

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? customer.isActive
            : !customer.isActive

      return matchesSearch && matchesStatus
    })
  }, [customers, search, statusFilter])

  useEffect(() => {
    if (!filteredCustomers.length) {
      setSelectedCustomer(null)
      return
    }

    if (!selectedCustomer || !filteredCustomers.some((customer) => customer.id === selectedCustomer.id)) {
      void loadCustomerDetail(filteredCustomers[0].id)
    }
  }, [filteredCustomers, selectedCustomer])

  const activeCount = customers.filter((customer) => customer.isActive).length
  const blockedCount = customers.length - activeCount
  const totalSpend = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const averageSpend = customers.length ? totalSpend / customers.length : 0

  const toggleStatus = async () => {
    if (!selectedCustomer) {
      return
    }

    try {
      setStatusUpdating(true)
      const { data } = await http.patch<UserDetail>(
        `/admin/users/${selectedCustomer.id}/status`,
        { isActive: !selectedCustomer.isActive },
      )

      setSelectedCustomer(data)
      toast.success(data.isActive ? 'Customer account reactivated.' : 'Customer account blocked.')
      await loadCustomers(data.id)
    } catch (statusError) {
      toast.error(getErrorMessage(statusError))
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Customer management"
        title="Monitor lifetime value, account health, and purchase activity"
        description="Review customer quality faster with a table for scanning and a focused detail panel for account actions."
        actions={<Button variant="outline" onClick={() => void loadCustomers(selectedCustomer?.id)}>Refresh</Button>}
      />

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-sm text-[#b91c1c]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <AdminSummaryCard
          title="Total customers"
          value={numberFormatter.format(customers.length)}
          icon={<Users className="h-5 w-5" />}
          description="Customer accounts tracked in the admin database."
        />
        <AdminSummaryCard
          title="Active accounts"
          value={numberFormatter.format(activeCount)}
          icon={<ShieldCheck className="h-5 w-5" />}
          description="Accounts that can still place and manage orders."
        />
        <AdminSummaryCard
          title="Blocked accounts"
          value={numberFormatter.format(blockedCount)}
          icon={<ShieldBan className="h-5 w-5" />}
          description="Accounts currently restricted by admin."
        />
        <AdminSummaryCard
          title="Average spend"
          value={formatCurrency(averageSpend)}
          icon={<Wallet className="h-5 w-5" />}
          description="Average lifetime spend across all customers."
        />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.2fr)_390px]">
        <div className="space-y-4">
          <AdminSearchFilterBar
            title="Customer directory"
            description="Search by name, email, or phone, then filter by account health."
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search customers..."
            filters={(
              <div className="min-w-[180px]">
                <Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'blocked')}
                >
                  <option value="all">All accounts</option>
                  <option value="active">Active only</option>
                  <option value="blocked">Blocked only</option>
                </Select>
              </div>
            )}
            actions={<Badge variant="muted">{numberFormatter.format(filteredCustomers.length)} results</Badge>}
          />

          {loading ? (
            <AdminLoadingSkeleton rows={7} />
          ) : (
            <DataTable
              isEmpty={filteredCustomers.length === 0}
              emptyTitle={search || statusFilter !== 'all' ? 'No customers match these filters' : 'No customers yet'}
              emptyDescription={
                search || statusFilter !== 'all'
                  ? 'Try a broader search term or switch the account filter.'
                  : 'Customer accounts will appear here once users start registering.'
              }
              columns={(
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Orders</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Spent</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
                </tr>
              )}
              footer={(
                <div className="text-sm text-slate-500">
                  Showing {numberFormatter.format(filteredCustomers.length)} of {numberFormatter.format(customers.length)} customers
                </div>
              )}
            >
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className={`transition hover:bg-[#fcfaf8] ${
                    selectedCustomer?.id === customer.id ? 'bg-[#fff8f2]' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-semibold ${
                        customer.isActive ? 'bg-[#fff4ed] text-[#c2410c]' : 'bg-[#f1f5f9] text-slate-500'
                      }`}>
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{customer.fullName}</div>
                        <div className="mt-1 text-sm text-slate-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {numberFormatter.format(customer.orderCount)}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={customer.isActive ? 'success' : 'muted'}>
                      {customer.isActive ? 'Active' : 'Blocked'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void loadCustomerDetail(customer.id)}
                    >
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
            <AdminLoadingSkeleton rows={4} />
          ) : selectedCustomer ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] font-display text-xl font-semibold ${
                      selectedCustomer.isActive ? 'bg-[#fff4ed] text-[#c2410c]' : 'bg-[#f1f5f9] text-slate-500'
                    }`}>
                      {selectedCustomer.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Badge variant={selectedCustomer.isActive ? 'success' : 'muted'}>
                        {selectedCustomer.isActive ? 'Active account' : 'Blocked account'}
                      </Badge>
                      <CardTitle className="mt-3">{selectedCustomer.fullName}</CardTitle>
                      <CardDescription>{selectedCustomer.role}</CardDescription>
                    </div>
                  </div>

                  {selectedCustomer.totalSpent >= 10_000_000 ? (
                    <Badge variant="warning">
                      <Crown className="h-3.5 w-3.5" />
                      VIP buyer
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="Total spend" value={formatCurrency(selectedCustomer.totalSpent)} />
                  <MiniMetric label="Orders" value={numberFormatter.format(selectedCustomer.orderCount)} />
                  <MiniMetric
                    label="Last order"
                    value={selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'No order yet'}
                  />
                </div>

                <div className="space-y-3 rounded-[22px] border border-[#f1ebe5] bg-[#fcfaf8] p-4">
                  <div className="text-sm font-semibold text-slate-900">Contact details</div>
                  <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={selectedCustomer.email} />
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={selectedCustomer.phone || 'Not provided'} />
                  <InfoRow label="Address" value={selectedCustomer.address || 'Not provided'} />
                  <InfoRow label="Joined" value={formatDate(selectedCustomer.createdAt)} />
                </div>

                <div className="rounded-[22px] border border-[#f1ebe5] bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Account actions</div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Use blocking only when the account needs to be restricted from ordering or signing in.
                  </p>
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    variant={selectedCustomer.isActive ? 'destructive' : 'default'}
                    disabled={statusUpdating}
                    onClick={() => void toggleStatus()}
                  >
                    {statusUpdating
                      ? 'Updating...'
                      : selectedCustomer.isActive
                        ? 'Block account'
                        : 'Reactivate account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AdminEmptyState
              title="No customer selected"
              description="Choose a customer from the table to inspect account details and manage account status."
            />
          )}
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#f1ebe5] bg-[#fcfaf8] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">{value}</div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#f1ebe5] bg-white px-4 py-3">
      {icon ? <div className="mt-0.5 text-slate-400">{icon}</div> : null}
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
        <div className="mt-1 text-sm font-medium text-slate-700">{value}</div>
      </div>
    </div>
  )
}
