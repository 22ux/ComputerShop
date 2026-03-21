import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const MainLayout = lazy(() => import('./layouts/MainLayout'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3fbff_0%,#f8fcff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-[#dceff7] bg-white px-6 py-10 text-sm text-slate-500 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        Loading the interface...
      </div>
    </div>
  )
}

export default App
