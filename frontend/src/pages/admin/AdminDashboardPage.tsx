import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  Boxes,
  CircleDollarSign,
  ShoppingCart,
  TriangleAlert,
  Users2,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { AdminChartCard } from '../../components/admin/admin-chart-card'
import { AdminLoadingSkeleton } from '../../components/admin/admin-loading-skeleton'
import { AdminPageHeader } from '../../components/admin/admin-page-header'
import { AdminSectionCard } from '../../components/admin/admin-section-card'
import { AdminStatCard } from '../../components/admin/admin-stat-card'
import { AdminStatusBadge } from '../../components/admin/admin-status-badge'
import { DataTable } from '../../components/admin/data-table'
import http from '../../lib/http'
import {
  getLowStockProducts,
  getNewestCustomers,
  getRevenueTrend,
  getStatusChartData,
  getTopProductsChartData,
} from '../../lib/admin/dashboard'
import { formatCurrency, formatDate, getErrorMessage } from '../../lib/utils'
import type {
  CustomerSummary,
  DashboardSummary,
  PagedResult,
  Product,
  RevenuePoint,
  StatusBreakdown,
  TopProduct,
} from '../../types'

const numberFormatter = new Intl.NumberFormat('en-US')

function EmptyChartState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#eadfd5] bg-[#fcfaf8] px-6 text-center">
      <div className="font-display text-lg font-semibold tracking-[-0.03em] text-slate-900">{title}</div>
      <p className="mt-2 max-w-sm text-sm leading-7 text-slate-500">{description}</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [statuses, setStatuses] = useState<StatusBreakdown[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        summaryRes,
        revenueRes,
        topProductsRes,
        statusesRes,
        productsRes,
        customersRes,
      ] = await Promise.all([
        http.get<DashboardSummary>('/admin/dashboard/summary'),
        http.get<RevenuePoint[]>('/admin/dashboard/revenue'),
        http.get<TopProduct[]>('/admin/dashboard/top-products'),
        http.get<StatusBreakdown[]>('/admin/dashboard/status-breakdown'),
        http.get<PagedResult<Product>>('/admin/products', { params: { pageSize: 30 } }),
        http.get<CustomerSummary[]>('/admin/users'),
      ])

      setSummary(summaryRes.data)
      setRevenue(revenueRes.data)
      setTopProducts(topProductsRes.data)
      setStatuses(statusesRes.data)
      setProducts(productsRes.data.items)
      setCustomers(customersRes.data)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  const revenueTrend = useMemo(() => getRevenueTrend(revenue), [revenue])
  const statusChartData = useMemo(() => getStatusChartData(statuses), [statuses])
  const topProductChartData = useMemo(() => getTopProductsChartData(topProducts), [topProducts])
  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products])
  const newestCustomers = useMemo(() => getNewestCustomers(customers), [customers])

  const pendingOrders = useMemo(
    () =>
      statuses
        .filter((item) => ['pending', 'confirmed'].includes(item.status.toLowerCase()))
        .reduce((sum, item) => sum + item.count, 0),
    [statuses],
  )

  if (loading) {
    return (
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Operations dashboard"
          title="Sales performance at a glance"
          description="Loading revenue, orders, customers, and inventory snapshots."
        />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdminLoadingSkeleton key={index} title={false} rows={1} />
          ))}
        </div>
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
          <AdminLoadingSkeleton rows={4} />
          <AdminLoadingSkeleton rows={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Operations dashboard"
        title="Revenue, order flow, and inventory health in one workspace"
        description="Track sales momentum, monitor fulfillment bottlenecks, and spot catalog risks with a cleaner commerce dashboard."
        actions={(
          <>
            <Button variant="outline" onClick={() => void loadDashboard()}>
              Refresh data
            </Button>
            <Button asChild>
              <Link to="/admin/orders">
                Review orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
      />

      <Card className="overflow-hidden bg-gradient-to-r from-[#fff7ed] via-white to-[#fffaf4]">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#c2410c]">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">
                Daily ops checklist
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Prioritize pending orders first, then restock low inventory items, and finally clean up product content to keep conversion healthy.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/admin/products">Review products</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/orders">Manage orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-sm text-[#b91c1c]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <AdminStatCard
          title="Monthly revenue"
          value={formatCurrency(summary?.monthRevenue ?? 0)}
          caption={`Today ${formatCurrency(summary?.todayRevenue ?? 0)}`}
          trend={revenueTrend}
          icon={<CircleDollarSign className="h-5 w-5" />}
          tone="orange"
        />
        <AdminStatCard
          title="Total orders"
          value={numberFormatter.format(summary?.totalOrders ?? 0)}
          caption={`${pendingOrders} orders need attention`}
          icon={<ShoppingCart className="h-5 w-5" />}
          tone="blue"
        />
        <AdminStatCard
          title="Live products"
          value={numberFormatter.format(summary?.totalProducts ?? 0)}
          caption={`${lowStockProducts.length} low-stock SKUs`}
          icon={<Boxes className="h-5 w-5" />}
          tone="green"
        />
        <AdminStatCard
          title="Customers"
          value={numberFormatter.format(summary?.totalCustomers ?? 0)}
          caption={`${newestCustomers.length} recent signups`}
          icon={<Users2 className="h-5 w-5" />}
          tone="violet"
        />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
        <AdminChartCard
          title="Revenue trend"
          description="Last 7 trading days. Use this to identify short-term momentum and campaign impact."
          actions={<Badge variant="warning">7-day snapshot</Badge>}
        >
          {revenue.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f2e9e2" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} stroke="#94a3b8" />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    tickMargin={12}
                    fontSize={12}
                    stroke="#94a3b8"
                    tickFormatter={(value) => `${Math.round(value / 1_000_000)}M`}
                  />
                  <RechartsTooltip
                    cursor={{ stroke: '#fdba74', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      borderRadius: '18px',
                      border: '1px solid #f1ebe5',
                      boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
                    }}
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Revenue']}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    fill="url(#revenueFill)"
                    activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState
              title="No revenue data yet"
              description="Revenue analytics will appear here as soon as orders start contributing sales data."
            />
          )}
        </AdminChartCard>

        <AdminChartCard
          title="Order status mix"
          description="See how many orders are waiting, moving, completed, or cancelled."
          actions={<Badge variant="info">{numberFormatter.format(statuses.reduce((sum, item) => sum + item.count, 0))} orders</Badge>}
        >
          {statusChartData.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      innerRadius={82}
                      outerRadius={112}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                    >
                      {statusChartData.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '18px',
                        border: '1px solid #f1ebe5',
                        boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {statusChartData.map((item) => (
                  <div key={item.status} className="flex items-center justify-between rounded-2xl border border-[#f1ebe5] bg-[#fcfaf8] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-slate-700">{item.status}</span>
                    </div>
                    <span className="font-display text-lg font-semibold tracking-[-0.03em] text-slate-900">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChartState
              title="No order pipeline yet"
              description="Status distribution will be shown after the first orders are created."
            />
          )}
        </AdminChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <AdminChartCard
          title="Top selling products"
          description="Best performers by quantity sold. Useful for stock planning and merchandising."
          actions={<Button asChild variant="outline"><Link to="/admin/products">Open catalog</Link></Button>}
        >
          {topProductChartData.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductChartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f2e9e2" />
                  <XAxis dataKey="shortName" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} stroke="#94a3b8" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} stroke="#94a3b8" />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '18px',
                      border: '1px solid #f1ebe5',
                      boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
                    }}
                    formatter={(value, _name, item) => {
                      const numericValue = Number(value ?? 0)
                      if (item.dataKey === 'quantitySold') {
                        return [numberFormatter.format(numericValue), 'Units sold']
                      }

                      return [formatCurrency(numericValue), 'Revenue']
                    }}
                  />
                  <Bar dataKey="quantitySold" fill="#fb923c" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState
              title="Top product analytics unavailable"
              description="The chart will be populated after order items are recorded."
            />
          )}
        </AdminChartCard>

        <div className="grid gap-5">
          <AdminSectionCard
            title="Low stock watchlist"
            description="Products closest to running out so the team can restock early."
            actions={<Badge variant="warning">{lowStockProducts.length} tracked</Badge>}
          >
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-2xl border border-[#f1ebe5] bg-[#fcfaf8] px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900">{product.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{product.brand} · {product.categoryName}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={product.stockQuantity <= 5 ? 'danger' : 'warning'}>
                        {product.stockQuantity} left
                      </Badge>
                      <div className="text-sm font-semibold text-slate-700">{formatCurrency(product.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChartState
                title="Inventory is healthy"
                description="No low-stock items were detected in the current product feed."
              />
            )}
          </AdminSectionCard>

          <AdminSectionCard
            title="Newest customers"
            description="Recently registered buyers worth monitoring for retention."
            actions={<Badge variant="muted">{newestCustomers.length} recent</Badge>}
          >
            {newestCustomers.length > 0 ? (
              <div className="space-y-3">
                {newestCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between rounded-2xl border border-[#f1ebe5] bg-white px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-900">{customer.fullName}</div>
                      <div className="mt-1 text-sm text-slate-500">{customer.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{formatCurrency(customer.totalSpent)}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatDate(customer.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChartState
                title="No new customers"
                description="Customer onboarding activity will appear here once new accounts are created."
              />
            )}
          </AdminSectionCard>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              Recent orders
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Keep an eye on the latest transactions without leaving the dashboard.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/orders">View all orders</Link>
          </Button>
        </div>

        <DataTable
          isEmpty={!summary?.recentOrders.length}
          emptyTitle="No recent orders"
          emptyDescription="New orders will show up here as customers start checking out."
          columns={(
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Order</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
            </tr>
          )}
          footer={(
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                {numberFormatter.format(summary?.recentOrders.length ?? 0)} newest orders loaded
              </div>
              <Button asChild variant="ghost">
                <Link to="/admin/orders">
                  Open order center
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        >
          {(summary?.recentOrders ?? []).map((order) => (
            <tr key={order.id} className="transition hover:bg-[#fcfaf8]">
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900">#{order.id}</div>
                <div className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-slate-900">{order.customerName || order.receiverName}</div>
                <div className="mt-1 text-sm text-slate-500">{order.customerEmail || order.receiverPhone}</div>
              </td>
              <td className="px-6 py-4">
                <AdminStatusBadge status={order.status} />
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</td>
              <td className="px-6 py-4 text-right">
                <Button asChild variant="ghost" className="text-[#c2410c]">
                  <Link to="/admin/orders">View</Link>
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  )
}
