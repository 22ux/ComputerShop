import type {
  CustomerSummary,
  Product,
  RevenuePoint,
  StatusBreakdown,
  TopProduct,
} from '../../types'

export function calculateTrend(current: number, previous: number) {
  if (previous <= 0) {
    return undefined
  }

  return Math.round(((current - previous) / previous) * 100)
}

export function getRevenueTrend(revenue: RevenuePoint[]) {
  if (revenue.length < 2) {
    return undefined
  }

  const previous = revenue[revenue.length - 2]?.revenue ?? 0
  const current = revenue[revenue.length - 1]?.revenue ?? 0
  return calculateTrend(current, previous)
}

export function getStatusChartData(statuses: StatusBreakdown[]) {
  return statuses.map((status, index) => ({
    ...status,
    color: ['#f97316', '#fb923c', '#38bdf8', '#22c55e', '#f87171'][index % 5],
  }))
}

export function getTopProductsChartData(products: TopProduct[]) {
  return products.slice(0, 6).map((product) => ({
    ...product,
    shortName:
      product.productName.length > 18
        ? `${product.productName.slice(0, 18)}...`
        : product.productName,
  }))
}

export function getLowStockProducts(products: Product[], limit = 5) {
  return [...products]
    .filter((product) => product.stockQuantity > 0)
    .sort((left, right) => left.stockQuantity - right.stockQuantity)
    .slice(0, limit)
}

export function getNewestCustomers(customers: CustomerSummary[], limit = 5) {
  return [...customers]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, limit)
}
