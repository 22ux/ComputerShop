import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Pencil, Plus, Shapes, Sparkles, Trash2 } from 'lucide-react'
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
import { getErrorMessage } from '../../lib/utils'
import type { Category } from '../../types'

const emptyForm = {
  name: '',
  description: '',
}

const numberFormatter = new Intl.NumberFormat('en-US')

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await http.get<Category[]>('/admin/categories')
      setCategories(data)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = [category.name, category.description]
        .join(' ')
        .toLowerCase()
        .includes(search.trim().toLowerCase())

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? !category.isDeleted
            : category.isDeleted

      return matchesSearch && matchesStatus
    })
  }, [categories, search, statusFilter])

  const activeCount = categories.filter((item) => !item.isDeleted).length
  const archivedCount = categories.filter((item) => item.isDeleted).length

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSubmitting(true)

      if (editingId) {
        await http.put(`/admin/categories/${editingId}`, form)
        toast.success('Category updated successfully.')
      } else {
        await http.post('/admin/categories', form)
        toast.success('Category created successfully.')
      }

      setForm(emptyForm)
      setEditingId(null)
      await loadCategories()
    } catch (submitError) {
      toast.error(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: number) => {
    try {
      await http.delete(`/admin/categories/${categoryId}`)
      toast.success('Category archived successfully.')
      if (editingId === categoryId) {
        setEditingId(null)
        setForm(emptyForm)
      }
      await loadCategories()
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError))
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Catalog structure"
        title="Clean up the category system your storefront depends on"
        description="Organize the catalog with clearer naming, softer archive states, and a faster editing flow for admins."
        actions={(
          <>
            <Button variant="outline" onClick={() => void loadCategories()}>
              Refresh
            </Button>
            <Button
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
              }}
            >
              <Plus className="h-4 w-4" />
              New category
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
          title="Total categories"
          value={numberFormatter.format(categories.length)}
          icon={<Shapes className="h-5 w-5" />}
          description="All taxonomy groups currently stored in admin."
        />
        <AdminSummaryCard
          title="Active categories"
          value={numberFormatter.format(activeCount)}
          icon={<Sparkles className="h-5 w-5" />}
          description="Visible groups still used by product management."
        />
        <AdminSummaryCard
          title="Archived categories"
          value={numberFormatter.format(archivedCount)}
          icon={<Trash2 className="h-5 w-5" />}
          description="Soft-deleted groups retained for historical consistency."
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <Card className="xl:sticky xl:top-6">
          <CardHeader>
            <Badge variant="warning">{editingId ? 'Editing mode' : 'Create mode'}</Badge>
            <CardTitle>{editingId ? 'Update category' : 'Create a new category'}</CardTitle>
            <CardDescription>
              Keep category names short, descriptive, and easy to scan in filters and admin tables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Category name">
                <Input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Gaming laptops"
                  required
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Use a short description to clarify the scope of this category."
                />
              </Field>

              <div className="rounded-[22px] border border-[#f1ebe5] bg-[#fcfaf8] p-4">
                <div className="text-sm font-semibold text-slate-900">Preview</div>
                <div className="mt-4 rounded-2xl border border-[#eadfd5] bg-white p-4">
                  <div className="font-display text-lg font-semibold tracking-[-0.03em] text-slate-900">
                    {form.name || 'Category name'}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {form.description || 'A short category description will appear here as a preview.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Create category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyForm)
                  }}
                >
                  Reset form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <AdminSearchFilterBar
            title="Category directory"
            description="Search by name or description, then focus on active or archived groups."
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search categories..."
            filters={(
              <div className="min-w-[180px]">
                <Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'archived')}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active only</option>
                  <option value="archived">Archived only</option>
                </Select>
              </div>
            )}
            actions={<Badge variant="muted">{numberFormatter.format(filteredCategories.length)} results</Badge>}
          />

          {loading ? (
            <AdminLoadingSkeleton rows={6} />
          ) : (
            <DataTable
              isEmpty={filteredCategories.length === 0}
              emptyTitle={search || statusFilter !== 'all' ? 'No categories match these filters' : 'No categories yet'}
              emptyDescription={
                search || statusFilter !== 'all'
                  ? 'Try a broader keyword or switch the status filter.'
                  : 'Create your first category to structure the storefront catalog.'
              }
              columns={(
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">ID</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                </tr>
              )}
              footer={
                <div className="text-sm text-slate-500">
                  Showing {numberFormatter.format(filteredCategories.length)} of {numberFormatter.format(categories.length)} categories
                </div>
              }
            >
              {filteredCategories.map((category) => (
                <tr key={category.id} className="transition hover:bg-[#fcfaf8]">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{category.name}</div>
                    <div className="mt-1 max-w-xl text-sm text-slate-500">
                      {category.description || 'No description added yet.'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={category.isDeleted ? 'muted' : 'success'}>
                      {category.isDeleted ? 'Archived' : 'Active'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">#{category.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingId(category.id)
                          setForm({
                            name: category.name,
                            description: category.description,
                          })
                        }}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title="Archive this category?"
                        description="The category will be soft-deleted. Existing product data remains intact, but the group should no longer be used for new items."
                        confirmLabel="Archive category"
                        onConfirm={() => handleDelete(category.id)}
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
