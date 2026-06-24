export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface UserProfile {
  id: number
  fullName: string
  email: string
  phone: string
  address: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  expiresAt: string
  user: UserProfile
}

export interface Category {
  id: number
  name: string
  description: string
  isDeleted: boolean
}

export interface ProductImage {
  id: number
  imageUrl: string
  displayOrder: number
}

export interface ProductAttribute {
  id: number
  attributeName: string
  attributeValue: string
}

export interface Review {
  id: number
  userId: number
  userFullName: string
  rating: number
  comment: string
  createdAt: string
}

export interface ProductVariant {
  id: number
  variantName: string
  price: number
  oldPrice?: number
  imageUrl: string
}

export interface Product {
  id: number
  name: string
  description: string
  specification?: string
  price: number
  oldPrice?: number
  warrantyMonths?: number
  stockQuantity: number
  imageUrl: string
  brand: string
  productGroupId?: string
  variantName?: string
  categoryId: number
  categoryName: string
  isDeleted: boolean
  createdAt: string
  averageRating?: number
  images?: ProductImage[]
  attributes?: ProductAttribute[]
  reviews?: Review[]
  variants?: ProductVariant[]
}

export interface InventoryItemDto {
  id: number
  serialNumber: string
  status: string
  importDate: string
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  imageUrl: string
  quantity: number
  stockQuantity: number
  unitPrice: number
  subTotal: number
}

export interface CartSummary {
  items: CartItem[]
  itemCount: number
  totalAmount: number
}

export interface OrderSummary {
  id: number
  customerName: string
  customerEmail: string
  receiverName: string
  receiverPhone: string
  totalAmount: number
  status: string
  paymentMethod: string
  itemCount: number
  createdAt: string
}

export interface OrderItem {
  productId: number
  productName: string
  imageUrl: string
  quantity: number
  unitPrice: number
  subTotal: number
}

export interface OrderDetail extends OrderSummary {
  shippingAddress: string
  note: string
  items: OrderItem[]
}

export interface CustomerSummary {
  id: number
  fullName: string
  email: string
  phone: string
  isActive: boolean
  createdAt: string
  orderCount: number
  totalSpent: number
}

export interface UserDetail extends CustomerSummary {
  address: string
  role: string
  lastOrderDate?: string | null
}

export interface DashboardSummary {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  todayRevenue: number
  monthRevenue: number
  recentOrders: OrderSummary[]
}

export interface RevenuePoint {
  date: string
  label: string
  revenue: number
}

export interface TopProduct {
  productName: string
  quantitySold: number
  revenue: number
}

export interface StatusBreakdown {
  status: string
  count: number
}

export interface ReturnRequest {
  id: number
  userId: number
  orderId: number
  productId: number
  productName: string
  productImageUrl: string
  reason: string
  status: string
  createdAt: string
}
