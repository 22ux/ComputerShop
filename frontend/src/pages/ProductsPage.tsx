import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import {
  StoreButton,
  StoreEmptyState,
  StoreField,
  StoreInput,
  StorePageHeader,
  StoreSelect,
  StoreSurface,
} from '../components/storefront/store-ui'
import http from '../lib/http'
import { getErrorMessage } from '../lib/utils'
import type { Category, PagedResult, Product } from '../types'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [result, setResult] = useState<PagedResult<Product>>({
    items: [],
    page: 1,
    pageSize: 8,
    totalCount: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filters = useMemo(
    () => ({
      searchTerm: searchParams.get('searchTerm') ?? '',
      categoryId: searchParams.get('categoryId') ?? '',
      brand: searchParams.get('brand') ?? '',
      sortBy: searchParams.get('sortBy') ?? 'newest',
      minPrice: searchParams.get('minPrice') ?? '',
      maxPrice: searchParams.get('maxPrice') ?? '',
      inStock: searchParams.get('inStock') ?? '',
      page: Number(searchParams.get('page') ?? '1'),
    }),
    [searchParams],
  )

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          http.get<Category[]>('/categories'),
          http.get<string[]>('/products/brands'),
        ])
        setCategories(categoriesRes.data)
        setBrands(brandsRes.data)
      } catch (err) {
        setError(getErrorMessage(err))
      }
    }

    void loadFilterData()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const { data } = await http.get<PagedResult<Product>>('/products', {
          params: {
            ...filters,
            pageSize: 8,
            categoryId: filters.categoryId || undefined,
            brand: filters.brand || undefined,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            inStock: filters.inStock === '' ? undefined : filters.inStock === 'true',
          },
        })

        setResult(data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    void loadProducts()
  }, [filters])

  const updateQuery = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value)
      } else {
        nextParams.delete(key)
      }
    })

    nextParams.set('page', updates.page ?? '1')
    setSearchParams(nextParams)
  }

  return (
    <div className="space-y-6">
      <StoreSurface className="p-6 sm:p-8">
        <StorePageHeader
          eyebrow="Catalog"
          title="Browse the full computer store with cleaner filters"
          description="Use the filter rail to narrow the catalog, then scan a calmer product grid with better pricing and inventory hierarchy."
        />
      </StoreSurface>

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-sm text-[#b91c1c]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <StoreSurface className="h-fit p-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">Filter products</div>
              <div className="mt-2 text-sm leading-7 text-slate-500">Refine by brand, category, price range, stock state, and sort order.</div>
            </div>

            <StoreField label="Search">
              <StoreInput
                value={filters.searchTerm}
                onChange={(event) => updateQuery({ searchTerm: event.target.value })}
                placeholder="Laptop, monitor..."
              />
            </StoreField>

            <StoreField label="Category">
              <StoreSelect value={filters.categoryId} onChange={(event) => updateQuery({ categoryId: event.target.value })}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </StoreSelect>
            </StoreField>

            <StoreField label="Brand">
              <StoreSelect value={filters.brand} onChange={(event) => updateQuery({ brand: event.target.value })}>
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </StoreSelect>
            </StoreField>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <StoreField label="Min price">
                <StoreInput value={filters.minPrice} onChange={(event) => updateQuery({ minPrice: event.target.value })} />
              </StoreField>
              <StoreField label="Max price">
                <StoreInput value={filters.maxPrice} onChange={(event) => updateQuery({ maxPrice: event.target.value })} />
              </StoreField>
            </div>

            <StoreField label="Inventory">
              <StoreSelect value={filters.inStock} onChange={(event) => updateQuery({ inStock: event.target.value })}>
                <option value="">All inventory states</option>
                <option value="true">In stock</option>
                <option value="false">Out of stock</option>
              </StoreSelect>
            </StoreField>

            <StoreField label="Sort by">
              <StoreSelect value={filters.sortBy} onChange={(event) => updateQuery({ sortBy: event.target.value })}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
              </StoreSelect>
            </StoreField>

            <StoreButton
              variant="secondary"
              className="w-full"
              onClick={() => setSearchParams(new URLSearchParams())}
            >
              <RotateCcw className="h-4 w-4" />
              Reset filters
            </StoreButton>
          </div>
        </StoreSurface>

        <div className="space-y-5">
          <StoreSurface className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">{result.totalCount} products</div>
                <div className="mt-2 text-sm text-slate-500">
                  {loading ? 'Loading products...' : 'Showing results for the current filters'}
                </div>
              </div>
            </div>
          </StoreSurface>

          {!loading && result.items.length === 0 ? (
            <StoreEmptyState
              title="No products matched your filters"
              description="Try a broader search term or reset the filter rail to discover more products."
              actionLabel="Reset filters"
              actionTo="/products"
            />
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {result.totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {Array.from({ length: Math.max(result.totalPages, 1) }).map((_, index) => {
                    const page = index + 1
                    const active = page === result.page
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => updateQuery({ page: String(page) })}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition ${
                          active
                            ? 'border-[#008ecc] bg-[#008ecc] text-white'
                            : 'border-[#d8edf6] bg-white text-slate-600 hover:border-[#9ddaf2] hover:text-[#008ecc]'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
