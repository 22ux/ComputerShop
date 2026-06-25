import { CheckCircle2, RefreshCcw, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminLoadingSkeleton } from '../../components/admin/admin-loading-skeleton'
import { AdminPageHeader } from '../../components/admin/admin-page-header'
import { AdminStatusBadge } from '../../components/admin/admin-status-badge'
import { DataTable } from '../../components/admin/data-table'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import http from '../../lib/http'
import { formatDate, getErrorMessage } from '../../lib/utils'
import type { ReturnRequest } from '../../types'

export default function AdminReturnsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  // Exchange Modal State
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null)
  const [oldSerial, setOldSerial] = useState('')
  const [newSerial, setNewSerial] = useState('')

  const loadRequests = async () => {
    try {
      setLoading(true)
      const { data } = await http.get<ReturnRequest[]>('/returnrequests')
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

  const updateStatus = async (id: number, status: string) => {
    try {
      setProcessingId(id)
      await http.patch(`/returnrequests/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
      })
      toast.success(`Request marked as ${status}`)
      await loadRequests()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setProcessingId(null)
    }
  }

  const handleProcessExchange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    try {
      setProcessingId(selectedRequest.id)
      await http.post(`/returnrequests/${selectedRequest.id}/process-exchange`, {
        oldSerialNumber: oldSerial,
        newSerialNumber: newSerial
      })
      toast.success('Exchange processed successfully. Inventory updated.')
      setIsExchangeModalOpen(false)
      setOldSerial('')
      setNewSerial('')
      await loadRequests()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setProcessingId(null)
    }
  }

  const openExchangeModal = (request: ReturnRequest) => {
    setSelectedRequest(request)
    setIsExchangeModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Return Requests (RMA)"
        description="Manage warranty claims, approve returns, and process product exchanges."
      />

      {loading ? (
        <AdminLoadingSkeleton rows={7} />
      ) : (
        <DataTable
          isEmpty={requests.length === 0}
          emptyTitle="No return requests"
          emptyDescription="There are currently no return requests from customers."
          columns={(
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">ID</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Order</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Product</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reason</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 text-right">Actions</th>
            </tr>
          )}
        >
          {requests.map((request) => (
            <tr key={request.id} className="transition hover:bg-[#fcfaf8]">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                #{request.id}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                User #{request.userId}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                Order #{request.orderId}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                <div className="flex items-center gap-3">
                  <img src={request.productImageUrl} alt={request.productName} className="h-10 w-10 rounded-lg object-cover" />
                  <span className="max-w-[200px] truncate">{request.productName}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 whitespace-normal min-w-[250px]" title={request.reason}>
                {request.reason}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <AdminStatusBadge status={request.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                {formatDate(request.createdAt)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  {request.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingId === request.id}
                        onClick={() => void updateStatus(request.id, 'Approved')}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={processingId === request.id}
                        onClick={() => void updateStatus(request.id, 'Rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {request.status === 'Approved' && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={processingId === request.id}
                      onClick={() => openExchangeModal(request)}
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Process Exchange
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {isExchangeModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-xl animate-in fade-in zoom-in-95 duration-200">
            <Button
              type="button"
              size="icon"
              className="absolute -right-3 -top-3 z-10 h-8 w-8 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
              onClick={() => setIsExchangeModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Card className="max-h-[90vh] overflow-y-auto shadow-2xl">
              <CardHeader>
                <CardTitle>Process Product Exchange</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProcessExchange} className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4 mb-4">
                    <h4 className="font-medium text-blue-900">Exchange Details</h4>
                    <p className="text-sm text-blue-700 mt-1">Order #{selectedRequest?.orderId} - {selectedRequest?.productName}</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Old Serial Number (Defective)</label>
                    <Input
                      value={oldSerial}
                      onChange={(e) => setOldSerial(e.target.value)}
                      placeholder="e.g. SN-OLD-123"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">This serial must be currently assigned to the order.</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">New Serial Number (Replacement)</label>
                    <Input
                      value={newSerial}
                      onChange={(e) => setNewSerial(e.target.value)}
                      placeholder="e.g. SN-NEW-456"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">This serial must be currently InStock.</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsExchangeModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processingId === selectedRequest?.id}>
                      Confirm Exchange
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}

