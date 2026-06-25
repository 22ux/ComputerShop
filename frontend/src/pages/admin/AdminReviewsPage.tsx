import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminEmptyState } from '../../components/admin/admin-empty-state'
import { AdminLoadingSkeleton } from '../../components/admin/admin-loading-skeleton'
import { AdminPageHeader } from '../../components/admin/admin-page-header'
import { AdminSearchFilterBar } from '../../components/admin/admin-search-filter-bar'
import { AdminSummaryCard } from '../../components/admin/admin-summary-card'
import { DataTable } from '../../components/admin/data-table'
import { Button } from '../../components/ui/button'
import { Select } from '../../components/ui/select'
import http from '../../lib/http'
import { formatDate, getErrorMessage } from '../../lib/utils'
import type { PagedResult, Review } from '../../types'

interface AdminReview extends Review {
  productId: number
  productName: string
}

const defaultFilters = {
  searchTerm: '',
  rating: '',
}

const ratingOptions = ['1', '2', '3', '4', '5']
const numberFormatter = new Intl.NumberFormat('en-US')

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'fill-none text-slate-200'}`}
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-slate-700">{rating}</span>
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [filters, setFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReviews = async (nextFilters = filters) => {
    try {
      setLoading(true)
      setError('')

      const { data } = await http.get<PagedResult<AdminReview>>('/admin/reviews', {
        params: {
          pageSize: 50,
          searchTerm: nextFilters.searchTerm || undefined,
          rating: nextFilters.rating || undefined,
        },
      })

      setReviews(data.items)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  }, [reviews])

  const highRatingCount = useMemo(
    () => reviews.filter((r) => r.rating >= 4).length,
    [reviews],
  )

  const lowRatingCount = useMemo(
    () => reviews.filter((r) => r.rating <= 2).length,
    [reviews],
  )

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await http.delete(`/admin/reviews/${reviewId}`)
      toast.success('Review deleted successfully.')
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError))
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Review moderation"
        title="Monitor and moderate customer product reviews"
        description="Browse all submitted reviews, filter by rating or keyword, and remove reviews that violate community guidelines."
        actions={<Button variant="outline" onClick={() => void loadReviews()}>Refresh</Button>}
      />

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-sm text-[#b91c1c]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <AdminSummaryCard
          title="Total reviews"
          value={numberFormatter.format(reviews.length)}
          icon={<Star className="h-5 w-5" />}
          description="All reviews loaded with the current filters."
        />
        <AdminSummaryCard
          title="Average rating"
          value={averageRating > 0 ? averageRating.toFixed(1) : '—'}
          icon={<Star className="h-5 w-5" />}
          description="Mean star rating across the loaded reviews."
        />
        <AdminSummaryCard
          title="Positive (4–5★)"
          value={numberFormatter.format(highRatingCount)}
          icon={<Star className="h-5 w-5" />}
          description="Reviews with a rating of 4 or 5 stars."
        />
        <AdminSummaryCard
          title="Critical (1–2★)"
          value={numberFormatter.format(lowRatingCount)}
          icon={<Star className="h-5 w-5" />}
          description="Reviews with a rating of 1 or 2 stars."
        />
      </div>

      <div className="space-y-4">
        <AdminSearchFilterBar
          title="Review table"
          description="Search by customer name or comment text, then narrow by star rating."
          searchValue={filters.searchTerm}
          onSearchChange={(value) => setFilters((current) => ({ ...current, searchTerm: value }))}
          searchPlaceholder="Search reviews..."
          filters={(
            <div className="min-w-[180px]">
              <Select
                value={filters.rating}
                onChange={(event) => setFilters((current) => ({ ...current, rating: event.target.value }))}
              >
                <option value="">All ratings</option>
                {ratingOptions.map((r) => (
                  <option key={r} value={r}>{r} star{r === '1' ? '' : 's'}</option>
                ))}
              </Select>
            </div>
          )}
          actions={(
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters(defaultFilters)
                  void loadReviews(defaultFilters)
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button onClick={() => void loadReviews()}>
                <Search className="h-4 w-4" />
                Apply
              </Button>
            </>
          )}
        />

        {loading ? (
          <AdminLoadingSkeleton rows={7} />
        ) : reviews.length === 0 ? (
          <AdminEmptyState
            title="No reviews found"
            description={
              filters.searchTerm || filters.rating
                ? 'Try a broader search query or clear the rating filter.'
                : 'Customer reviews will appear here once products receive feedback.'
            }
          />
        ) : (
          <DataTable
            isEmpty={reviews.length === 0}
            emptyTitle="No reviews found"
            emptyDescription="Customer reviews will appear here once products receive feedback."
            columns={(
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Product</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Rating</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Comment</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
              </tr>
            )}
            footer={(
              <div className="text-sm text-slate-500">
                {numberFormatter.format(reviews.length)} reviews loaded in the current view
              </div>
            )}
          >
            {reviews.map((review) => (
              <tr key={review.id} className="transition hover:bg-[#fcfaf8]">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{review.userFullName}</div>
                  <div className="mt-1 text-sm text-slate-500">ID #{review.userId}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-[180px] truncate text-sm font-medium text-slate-700">
                    {review.productName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StarRating rating={review.rating} />
                </td>
                <td className="px-6 py-4">
                  <p className="max-w-[260px] truncate text-sm text-slate-600">{review.comment || '—'}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(review.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void handleDelete(review.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  )
}
