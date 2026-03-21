import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import http from '../lib/http'
import type { CartSummary } from '../types'
import { useAuth } from './AuthContext'

interface CartContextValue {
  cart: CartSummary
  isLoading: boolean
  refreshCart: () => Promise<void>
  addToCart: (productId: number, quantity: number) => Promise<void>
  updateItem: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  clearCart: () => Promise<void>
}

const emptyCart: CartSummary = {
  items: [],
  itemCount: 0,
  totalAmount: 0,
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [cart, setCart] = useState<CartSummary>(emptyCart)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasBootstrapped, setHasBootstrapped] = useState(false)

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(emptyCart)
      setHasBootstrapped(true)
      return
    }

    setIsRefreshing(true)
    try {
      const { data } = await http.get<CartSummary>('/cart')
      setCart(data)
    } finally {
      setIsRefreshing(false)
      setHasBootstrapped(true)
    }
  }

  useEffect(() => {
    if (authLoading) {
      return
    }

    setHasBootstrapped(false)
    void refreshCart()
  }, [authLoading, isAuthenticated])

  const requireAuth = () => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to use your cart.')
    }
  }

  const isLoading = authLoading || isRefreshing || (isAuthenticated && !hasBootstrapped)

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      refreshCart,
      addToCart: async (productId, quantity) => {
        requireAuth()
        const { data } = await http.post<CartSummary>('/cart/items', { productId, quantity })
        setCart(data)
      },
      updateItem: async (cartItemId, quantity) => {
        requireAuth()
        const { data } = await http.put<CartSummary>(`/cart/items/${cartItemId}`, { quantity })
        setCart(data)
      },
      removeItem: async (cartItemId) => {
        requireAuth()
        await http.delete(`/cart/items/${cartItemId}`)
        await refreshCart()
      },
      clearCart: async () => {
        requireAuth()
        await http.delete('/cart')
        setCart(emptyCart)
      },
    }),
    [cart, isAuthenticated, isLoading],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
