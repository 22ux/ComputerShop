import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Boxes,
  CloudUpload,
  ImageOff,
  Package2,
  Pencil,
  Plus,
  ScanSearch,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { AdminLoadingSkeleton } from '../../components/admin/admin-loading-skeleton'
import { AdminPageHeader } from '../../components/admin/admin-page-header'
import { AdminSearchFilterBar } from '../../components/admin/admin-search-filter-bar'
import { AdminSummaryCard } from '../../components/admin/admin-summary-card'
import { ConfirmDialog } from '../../components/admin/confirm-dialog'
import { DataTable } from '../../components/admin/data-table'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import http from '../../lib/http'
import { formatCurrency, getErrorMessage } from '../../lib/utils'
import type { Category, PagedResult, Product, InventoryItemDto } from '../../types'

const emptyProductForm = {
  name: '',
  description: '',
  specification: '',
  price: 0,
  oldPrice: undefined as number | undefined,
  warrantyMonths: 24,
  stockQuantity: 0,
  imageUrl: '',
  brand: '',
  productGroupId: '',
  variantName: '',
  categoryId: 0,
}

const numberFormatter = new Intl.NumberFormat('en-US')

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(emptyProductForm)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')
  const [error, setError] = useState('')
  const [isFormVisible, setIsFormVisible] = useState(false)

  const [inventoryProductId, setInventoryProductId] = useState<number | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItemDto[]>([])
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [serialInput, setSerialInput] = useState('')
  const [submittingInventory, setSubmittingInventory] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [categoriesRes, productsRes] = await Promise.all([
        http.get<Category[]>('/admin/categories'),
        http.get<PagedResult<Product>>('/admin/products', { params: { pageSize: 50 } }),
      ])

      setCategories(categoriesRes.data.filter((item) => !item.isDeleted))
      setProducts(productsRes.data.items)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = [
        product.name,
        product.brand,
        product.categoryName,
        product.description,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.trim().toLowerCase())

      const matchesCategory = categoryFilter === 'all' ? true : String(product.categoryId) === categoryFilter

      const matchesStock =
        stockFilter === 'all'
          ? true
          : stockFilter === 'in-stock'
            ? product.stockQuantity > 5
            : stockFilter === 'low-stock'
              ? product.stockQuantity > 0 && product.stockQuantity <= 5
              : product.stockQuantity <= 0

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [categoryFilter, products, search, stockFilter])

  const lowStockCount = products.filter((item) => item.stockQuantity > 0 && item.stockQuantity <= 5).length
  const outOfStockCount = products.filter((item) => item.stockQuantity <= 0).length
  const liveCount = products.filter((item) => !item.isDeleted).length

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.categoryId) {
      toast.error('Please select a category before saving the product.')
      return
    }

    try {
      setSubmitting(true)

      if (editingId) {
        await http.put(`/admin/products/${editingId}`, form)
        toast.success('Product updated successfully.')
      } else {
        await http.post('/admin/products', form)
        toast.success('Product created successfully.')
      }

      setEditingId(null)
      setForm(emptyProductForm)
      setIsFormVisible(false)
      await loadData()
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)
      const data = new FormData()
      data.append('file', file)

      const response = await http.post<{ url: string }>('/admin/uploads/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setForm((current) => ({ ...current, imageUrl: response.data.url }))
      toast.success('Image uploaded successfully.')
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError))
    } finally {
      setUploading(false)
    }
  }

  const loadInventory = async (productId: number) => {
    try {
      setLoadingInventory(true)
      const { data } = await http.get<InventoryItemDto[]>(`/admin/products/${productId}/inventory`)
      setInventoryItems(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoadingInventory(false)
    }
  }

  const handleOpenInventory = (productId: number) => {
    setInventoryProductId(productId)
    setSerialInput('')
    void loadInventory(productId)
  }

  const handleCloseInventory = () => {
    setInventoryProductId(null)
    setInventoryItems([])
    setSerialInput('')
  }

  const handleAddStock = async (e: FormEvent) => {
    e.preventDefault()
    if (!inventoryProductId) return
    const serials = serialInput.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    if (serials.length === 0) {
      toast.error('Vui lòng nhập ít nhất 1 số Seri.')
      return
    }

    try {
      setSubmittingInventory(true)
      await http.post(`/admin/products/${inventoryProductId}/inventory/add-stock`, {
        serialNumbers: serials
      })
      toast.success(`Đã thêm ${serials.length} sản phẩm vào kho.`)
      setSerialInput('')
      await loadInventory(inventoryProductId)
      void loadData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmittingInventory(false)
    }
  }

  const handleDelete = async (productId: number) => {
    try {
      await http.delete(`/admin/products/${productId}`)
      toast.success('Product archived successfully.')

      if (editingId === productId) {
        setEditingId(null)
        setForm(emptyProductForm)
      }

      await loadData()
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError))
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Catalog management"
        title="Manage pricing, inventory, content, and product media from one view"
        description="Keep the catalog polished with a faster editor, clearer stock signals, and a more professional product table."
        actions={(
          <>
            <Button variant="outline" onClick={() => void loadData()}>
              Refresh
            </Button>
            <Button
              onClick={() => {
                setEditingId(null)
                setForm(emptyProductForm)
                setIsFormVisible(true)
              }}
            >
              <Plus className="h-4 w-4" />
              New product
            </Button>
          </>
        )}
      />

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-sm text-[#b91c1c]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <AdminSummaryCard
          title="Live products"
          value={numberFormatter.format(liveCount)}
          icon={<Package2 className="h-5 w-5" />}
          description="Products currently active in the catalog."
        />
        <AdminSummaryCard
          title="Low stock items"
          value={numberFormatter.format(lowStockCount)}
          icon={<ShieldAlert className="h-5 w-5" />}
          description="Items that need replenishment soon."
        />
        <AdminSummaryCard
          title="Out of stock"
          value={numberFormatter.format(outOfStockCount)}
          icon={<ScanSearch className="h-5 w-5" />}
          description="Products that currently cannot be fulfilled."
        />
      </div>

      <div className="grid gap-5 grid-cols-1">
        {isFormVisible ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="relative w-full max-w-xl animate-in fade-in zoom-in-95 duration-200">
              <Button
                type="button"
                size="icon"
                className="absolute -right-3 -top-3 z-10 h-8 w-8 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyProductForm)
                  setIsFormVisible(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Card className="max-h-[90vh] overflow-y-auto shadow-2xl">
          <CardHeader>
            <Badge variant={editingId ? 'info' : 'warning'}>
              {editingId ? 'Editing product' : 'Create product'}
            </Badge>
            <CardTitle>{editingId ? 'Update product' : 'Add a new product'}</CardTitle>
            <CardDescription>
              Write concise product copy, keep specifications readable, and make the primary image strong enough for the storefront card.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitProduct} className="space-y-5">
              <Field label="Product name">
                <Input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="ASUS ROG Strix G16"
                  required
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Short storefront description..."
                  required
                />
              </Field>

              <Field label="Specifications">
                <Textarea
                  value={form.specification}
                  onChange={(event) => setForm({ ...form, specification: event.target.value })}
                  placeholder="CPU, GPU, RAM, storage, display, and notable features."
                  className="min-h-[140px]"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price">
                  <Input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                    required
                  />
                </Field>
                <Field label="Old price (optional)">
                  <Input
                    type="number"
                    min={0}
                    value={form.oldPrice || ''}
                    onChange={(event) => setForm({ ...form, oldPrice: event.target.value ? Number(event.target.value) : undefined })}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Stock quantity">
                  <Input
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(event) => setForm({ ...form, stockQuantity: Number(event.target.value) })}
                    required
                  />
                </Field>
                <Field label="Warranty (months)">
                  <Input
                    type="number"
                    min={0}
                    value={form.warrantyMonths}
                    onChange={(event) => setForm({ ...form, warrantyMonths: Number(event.target.value) })}
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Brand">
                  <Input
                    value={form.brand}
                    onChange={(event) => setForm({ ...form, brand: event.target.value })}
                    placeholder="ASUS"
                    required
                  />
                </Field>
                <Field label="Category">
                  <Select
                    value={form.categoryId}
                    onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })}
                    required
                  >
                    <option value={0}>Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Product Group ID (Optional)">
                  <Input
                    value={form.productGroupId}
                    onChange={(event) => setForm({ ...form, productGroupId: event.target.value })}
                    placeholder="E.g., dell-g15-5530"
                  />
                </Field>
                <Field label="Variant Name (Optional)">
                  <Input
                    value={form.variantName}
                    onChange={(event) => setForm({ ...form, variantName: event.target.value })}
                    placeholder="E.g., RAM 8GB - SSD 512GB"
                  />
                </Field>
              </div>

              <Field label="Image URL">
                <Input
                  value={form.imageUrl}
                  onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                  placeholder="https://..."
                />
              </Field>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <label className="cursor-pointer">
                    <CloudUpload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload image'}
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) {
                          void uploadImage(file)
                        }
                      }}
                    />
                  </label>
                </Button>
                <Button type="submit" disabled={submitting || uploading}>
                  {submitting ? 'Saving...' : editingId ? 'Save product' : 'Create product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyProductForm)
                    setIsFormVisible(false)
                  }}
                >
                  Cancel
                </Button>
              </div>

              <div className="rounded-[22px] border border-[#f1ebe5] bg-[#fcfaf8] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Card preview</div>
                    <div className="mt-1 text-sm text-slate-500">How this product feels inside a polished storefront grid.</div>
                  </div>
                  {form.stockQuantity > 0 ? (
                    <Badge variant={form.stockQuantity <= 5 ? 'warning' : 'success'}>
                      {form.stockQuantity <= 5 ? 'Low stock' : 'In stock'}
                    </Badge>
                  ) : (
                    <Badge variant="danger">Out of stock</Badge>
                  )}
                </div>

                <div className="mt-4 overflow-hidden rounded-[24px] border border-[#eadfd5] bg-white">
                  <div className="aspect-[4/3] bg-[#f8fafc]">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt={form.name || 'Product preview'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImageOff className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted">{form.brand || 'Brand'}</Badge>
                      <Badge variant="warning">
                        {categories.find((item) => item.id === form.categoryId)?.name || 'Category'}
                      </Badge>
                    </div>
                    <div className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">
                      {form.name || 'Product name'}
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                      {form.description || 'A concise product description helps the storefront feel more premium.'}
                    </p>
                    <div className="text-lg font-semibold text-[#c2410c]">
                      {formatCurrency(form.price || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <AdminSearchFilterBar
            title="Product catalog"
            description="Search by product name, brand, or category, then refine inventory health with quick filters."
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search products..."
            filters={(
              <>
                <div className="min-w-[180px]">
                  <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                    <option value="all">All categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="min-w-[180px]">
                  <Select
                    value={stockFilter}
                    onChange={(event) =>
                      setStockFilter(event.target.value as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock')
                    }
                  >
                    <option value="all">All stock states</option>
                    <option value="in-stock">Healthy stock</option>
                    <option value="low-stock">Low stock</option>
                    <option value="out-of-stock">Out of stock</option>
                  </Select>
                </div>
              </>
            )}
            actions={<Badge variant="muted">{numberFormatter.format(filteredProducts.length)} results</Badge>}
          />

          {loading ? (
            <AdminLoadingSkeleton rows={7} />
          ) : (
            <DataTable
              isEmpty={filteredProducts.length === 0}
              emptyTitle={search || categoryFilter !== 'all' || stockFilter !== 'all' ? 'No products match these filters' : 'No products yet'}
              emptyDescription={
                search || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Try a different keyword or reset the catalog filters.'
                  : 'Create your first product to populate the admin catalog.'
              }
              columns={(
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                </tr>
              )}
              footer={(
                <div className="text-sm text-slate-500">
                  Showing {numberFormatter.format(filteredProducts.length)} of {numberFormatter.format(products.length)} products
                </div>
              )}
            >
              {filteredProducts.map((product) => (
                <tr key={product.id} className="transition hover:bg-[#fcfaf8]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#f1ebe5] bg-[#f8fafc]">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">{product.name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="muted">{product.brand}</Badge>
                          <Badge variant="warning">{product.categoryName}</Badge>
                        </div>
                        <div className="mt-2 line-clamp-1 text-sm text-slate-500">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{numberFormatter.format(product.stockQuantity)}</div>
                    <div className="mt-1 text-sm text-slate-500">units</div>
                  </td>
                  <td className="px-6 py-4">
                    {product.stockQuantity <= 0 ? (
                      <Badge variant="danger">Out of stock</Badge>
                    ) : product.stockQuantity <= 5 ? (
                      <Badge variant="warning">Low stock</Badge>
                    ) : (
                      <Badge variant="success">Healthy stock</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenInventory(product.id)}
                        aria-label={`Manage inventory for ${product.name}`}
                      >
                        <Boxes className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingId(product.id)
                          setForm({
                            name: product.name,
                            description: product.description,
                            specification: product.specification ?? '',
                            price: product.price,
                            oldPrice: product.oldPrice,
                            warrantyMonths: product.warrantyMonths ?? 24,
                            stockQuantity: product.stockQuantity,
                            imageUrl: product.imageUrl,
                            brand: product.brand,
                            productGroupId: product.productGroupId ?? '',
                            variantName: product.variantName ?? '',
                            categoryId: product.categoryId,
                          })
                          setIsFormVisible(true)
                        }}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title="Archive this product?"
                        description="The product will be soft-deleted. Existing order history remains intact, but the item should no longer be used in the active catalog."
                        confirmLabel="Archive product"
                        onConfirm={() => handleDelete(product.id)}
                        trigger={(
                          <Button type="button" variant="ghost" size="icon" className="text-[#dc2626] hover:text-[#dc2626]">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </div>

      {inventoryProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl animate-in fade-in zoom-in-95 duration-200">
            <Button
              type="button"
              size="icon"
              className="absolute -right-3 -top-3 z-10 h-8 w-8 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
              onClick={handleCloseInventory}
            >
              <X className="h-4 w-4" />
            </Button>
            <Card className="max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col xl:flex-row">
              <div className="flex-1 p-6 border-b xl:border-b-0 xl:border-r border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Nhập kho (Add Stock)</h3>
                <p className="text-sm text-slate-500 mb-4">Nhập các số seri của sản phẩm, mỗi số trên 1 dòng.</p>
                <form onSubmit={handleAddStock} className="space-y-4">
                  <Textarea
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="SN10001&#10;SN10002&#10;SN10003"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-500">
                      Đã nhập: {serialInput.split('\n').filter(s => s.trim().length > 0).length} số seri
                    </div>
                    <Button type="submit" disabled={submittingInventory}>
                      {submittingInventory ? 'Đang lưu...' : 'Nhập kho'}
                    </Button>
                  </div>
                </form>
              </div>
              <div className="flex-1 p-6 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Lịch sử tồn kho</h3>
                {loadingInventory ? (
                  <div className="text-sm text-slate-500">Đang tải...</div>
                ) : inventoryItems.length === 0 ? (
                  <div className="text-sm text-slate-500">Chưa có dữ liệu tồn kho.</div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 font-medium text-slate-500">Số Seri</th>
                          <th className="px-4 py-2 font-medium text-slate-500">Trạng thái</th>
                          <th className="px-4 py-2 font-medium text-slate-500">Ngày nhập</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventoryItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-mono text-slate-700">{item.serialNumber}</td>
                            <td className="px-4 py-2">
                              <Badge variant={item.status === 'InStock' ? 'success' : 'muted'}>{item.status}</Badge>
                            </td>
                            <td className="px-4 py-2 text-slate-500">{new Date(item.importDate).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-800">{label}</div>
      {children}
    </label>
  )
}
