import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import {
  StoreButton,
  StoreEmptyState,
  StoreInput,
  StorePageHeader,
  StoreSurface,
} from '../components/storefront/store-ui'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import http from '../lib/http'
import { formatCurrency, getErrorMessage } from '../lib/utils'
import type { Product } from '../types'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const { data } = await http.get<Product>(`/products/${id}`)
        setProduct(data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      void loadProduct()
    }
  }, [id])

  const handleAddToCart = async () => {
    if (!product) {
      return
    }

    try {
      if (!isAuthenticated) {
        navigate('/login')
        return
      }

      await addToCart(product.id, quantity)
      toast.success('Added to cart.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <StoreSurface className="p-6 sm:p-8">
        <StorePageHeader eyebrow="Product detail" title="Loading product details" />
      </StoreSurface>
    )
  }

  if (!product) {
    return (
      <StoreEmptyState
        title="Product not found"
        description={error || 'The product may have been removed from the catalog.'}
        actionLabel="Back to catalog"
        actionTo="/products"
      />
    )
  }

  return (
    <div className="space-y-6">
      <StoreSurface className="p-6 sm:p-8">
        <StorePageHeader
          eyebrow={product.categoryName}
          title={product.name}
          description={product.description}
        />
      </StoreSurface>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <StoreSurface className="overflow-hidden p-4 sm:p-5">
          <div className="overflow-hidden rounded-[28px] bg-[#f2fbff]">
            <img src={product.imageUrl} alt={product.name} className="h-full min-h-[480px] w-full object-cover" />
          </div>
        </StoreSurface>

        <div className="space-y-6">
          <StoreSurface className="p-6 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#eff9fd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#008ecc]">{product.brand}</span>
              <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{product.categoryName}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                product.stockQuantity > 0 ? 'bg-[#effcf4] text-[#15803d]' : 'bg-[#fef2f2] text-[#dc2626]'
              }`}>
                {product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
              </span>
            </div>

            <div className="mt-6 grid gap-4 rounded-[28px] bg-[#f8fcff] p-5 sm:grid-cols-3">
              <Metric label="Price" value={formatCurrency(product.price)} />
              <Metric label="Stock" value={String(product.stockQuantity)} />
              <Metric label="Category" value={product.categoryName} />
            </div>

            <div className="mt-6 max-w-[180px]">
              <div className="mb-2 text-sm font-semibold text-slate-800">Quantity</div>
              <StoreInput
                type="number"
                min={1}
                max={Math.max(product.stockQuantity, 1)}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <StoreButton
                type="button"
                className="flex-1"
                onClick={() => void handleAddToCart()}
                disabled={product.stockQuantity <= 0}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </StoreButton>
              <StoreButton type="button" variant="secondary" className="flex-1" onClick={() => navigate('/products')}>
                <ArrowLeft className="h-4 w-4" />
                Back to catalog
              </StoreButton>
            </div>
          </StoreSurface>

          <StoreSurface className="p-6 sm:p-7">
            <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">Technical specifications</div>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-8 text-slate-600">
              {product.specification || 'No technical specification has been added for this product yet.'}
            </pre>
          </StoreSurface>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">{value}</div>
    </div>
  )
}
