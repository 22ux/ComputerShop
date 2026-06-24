import { PackageX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { StoreEmptyState, StorePageHeader, StoreStatusBadge, StoreSurface } from '../components/storefront/store-ui'
import http from '../lib/http'
import { formatCurrency, formatDate, getErrorMessage } from '../lib/utils'
import type { ReturnRequest } from '../types'

export default function ReturnRequestsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadRequests = async () => {
    try {
      setLoading(true)
      const { data } = await http.get<ReturnRequest[]>('/returnrequests/my-returns')
      setRequests(data)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  if (!loading && requests.length === 0) {
    return (
      <StoreEmptyState
        title="Không có yêu cầu bảo hành/đổi trả nào"
        description="Bạn chưa tạo yêu cầu bảo hành hay đổi trả sản phẩm nào."
        actionLabel="Xem đơn hàng"
        actionTo="/account/orders"
      />
    )
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        eyebrow="Bảo hành"
        title="Yêu cầu bảo hành & đổi trả"
        description="Theo dõi trạng thái các yêu cầu bảo hành, đổi trả sản phẩm bị lỗi."
      />

      <div className="space-y-4">
        {loading ? (
          <StoreSurface className="p-6 text-sm text-slate-500">Đang tải danh sách...</StoreSurface>
        ) : (
          requests.map((request) => (
            <StoreSurface key={request.id} className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#008ecc]">
                    Yêu cầu #{request.id}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Tạo ngày {formatDate(request.createdAt)}
                  </div>
                </div>
                <StoreStatusBadge status={request.status} />
              </div>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                {request.productImageUrl ? (
                  <img
                    src={request.productImageUrl}
                    alt={request.productName}
                    className="h-24 w-24 rounded-[22px] object-cover border border-[#dceff7]"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[22px] bg-[#f8fcff] text-[#008ecc]">
                    <PackageX className="h-8 w-8" />
                  </div>
                )}
                
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <div className="font-semibold text-slate-900">{request.productName}</div>
                    <div className="text-sm text-slate-500">Thuộc Đơn hàng #{request.orderId}</div>
                  </div>
                  
                  <div className="rounded-[16px] bg-[#fef2f2] p-4 border border-[#fecaca]">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b91c1c]">Lý do lỗi</div>
                    <div className="mt-1 text-sm text-[#991b1b]">{request.reason}</div>
                  </div>
                </div>
              </div>
            </StoreSurface>
          ))
        )}
      </div>
    </div>
  )
}
