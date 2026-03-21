import {
  LayoutDashboard,
  Package2,
  Shapes,
  ShoppingCart,
  Users,
} from 'lucide-react'

export const adminNavigation = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    description: 'Revenue, orders, and trends',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'revenue', 'stats', 'overview'],
  },
  {
    to: '/admin/categories',
    label: 'Categories',
    description: 'Catalog structure',
    icon: Shapes,
    keywords: ['categories', 'catalog', 'taxonomy'],
  },
  {
    to: '/admin/products',
    label: 'Products',
    description: 'Inventory and pricing',
    icon: Package2,
    keywords: ['products', 'inventory', 'stock'],
  },
  {
    to: '/admin/customers',
    label: 'Customers',
    description: 'Accounts and lifetime value',
    icon: Users,
    keywords: ['customers', 'users', 'accounts'],
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    description: 'Order operations',
    icon: ShoppingCart,
    keywords: ['orders', 'shipping', 'workflow'],
  },
] as const

export const adminRouteMeta: Record<string, { title: string; description: string }> = {
  '/admin/dashboard': {
    title: 'Sales dashboard',
    description: 'Monitor revenue, order momentum, inventory health, and growth in one place.',
  },
  '/admin/categories': {
    title: 'Category management',
    description: 'Keep the catalog tidy with clear groupings and quick edits.',
  },
  '/admin/products': {
    title: 'Product management',
    description: 'Manage pricing, thumbnails, stock, and product content from one workspace.',
  },
  '/admin/customers': {
    title: 'Customer management',
    description: 'Review customer value, account status, and recent activity at a glance.',
  },
  '/admin/orders': {
    title: 'Order management',
    description: 'Track the full order lifecycle and update statuses with less friction.',
  },
}
