import { ArrowRight, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { formatCurrency, getErrorMessage } from '../lib/utils'
import type { Product } from '../types'
import { StoreButton } from './storefront/store-ui'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const isInStock = product.stockQuantity > 0

  const handleAdd = async () => {
    try {
      if (!isAuthenticated) {
        navigate('/login')
        return
      }

      await addToCart(product.id, 1)
      toast.success('Added to cart.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-[#dceff7] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#9ddaf2] hover:shadow-[0_22px_60px_rgba(0,142,204,0.12)]">
      <div className="relative overflow-hidden bg-[#f2fbff]">
        <Link to={`/products/${product.id}`} className="block">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-60 w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#008ecc] shadow-sm">
          {isInStock ? 'In stock' : 'Sold out'}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full bg-[#eff9fd] px-3 py-1 text-[#008ecc]">{product.brand}</span>
          <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-slate-500">{product.categoryName}</span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="mt-4 line-clamp-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900 transition hover:text-[#008ecc]"
        >
          {product.name}
        </Link>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
          {product.description}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Price</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              {formatCurrency(product.price)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Stock</div>
            <div className="mt-2 text-sm font-semibold text-slate-700">
              {isInStock ? `${product.stockQuantity} units` : 'Unavailable'}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link
            to={`/products/${product.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#008ecc] transition hover:text-[#006f98]"
          >
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>

          <StoreButton
            type="button"
            size="sm"
            onClick={() => void handleAdd()}
            disabled={!isInStock}
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </StoreButton>
        </div>
      </div>
    </article>
  )
}
