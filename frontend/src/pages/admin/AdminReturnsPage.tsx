import { CheckCircle2, XCircle, RefreshCcw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AdminButton,
  AdminEmptyState,
  AdminPageHeader,
  AdminStatusBadge,
  AdminSurface,
  AdminTable,
  AdminModal,
  AdminInput
} from '../../components/admin/admin-ui'
import http from '../../lib/http'
import { formatDate, getErrorMessage } from '../../lib/utils'
import type { ReturnRequest, InventoryItemDto } from '../../types'

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

      <AdminSurface>
        <AdminTable
          columns={['ID', 'Customer', 'Order', 'Product', 'Reason', 'Status', 'Date', 'Actions']}
          loading={loading}
          data={requests}
          emptyState={
            <AdminEmptyState
              icon={<RefreshCcw className="h-6 w-6" />}
              title="No return requests"
              description="There are currently no return requests from customers."
            />
          }
          renderRow={(request) => (
            <tr key={request.id}>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
                #{request.id}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                User #{request.userId}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                Order #{request.orderId}
              </td>
              <td className="px-4 py-4 text-sm text-slate-500">
                <div className="flex items-center gap-3">
                  <img src={request.productImageUrl} alt={request.productName} className="h-10 w-10 rounded-lg object-cover" />
                  <span className="max-w-[200px] truncate">{request.productName}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                {request.reason}
              </td>
              <td className="whitespace-nowrap px-4 py-4">
                <AdminStatusBadge status={request.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                {formatDate(request.createdAt)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm">
                <div className="flex items-center gap-2">
                  {request.status === 'Pending' && (
                    <>
                      <AdminButton
                        size="sm"
                        variant="secondary"
                        disabled={processingId === request.id}
                        onClick={() => void updateStatus(request.id, 'Approved')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </AdminButton>
                      <AdminButton
                        size="sm"
                        variant="danger"
                        disabled={processingId === request.id}
                        onClick={() => void updateStatus(request.id, 'Rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </AdminButton>
                    </>
                  )}
                  {request.status === 'Approved' && (
                    <AdminButton
                      size="sm"
                      variant="primary"
                      disabled={processingId === request.id}
                      onClick={() => openExchangeModal(request)}
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Process Exchange
                    </AdminButton>
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      </AdminSurface>

      <AdminModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        title="Process Product Exchange"
      >
        <form onSubmit={handleProcessExchange} className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 mb-4">
            <h4 className="font-medium text-blue-900">Exchange Details</h4>
            <p className="text-sm text-blue-700 mt-1">Order #{selectedRequest?.orderId} - {selectedRequest?.productName}</p>
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Old Serial Number (Defective)</label>
            <AdminInput
              value={oldSerial}
              onChange={(e) => setOldSerial(e.target.value)}
              placeholder="e.g. SN-OLD-123"
              required
            />
            <p className="mt-1 text-xs text-slate-500">This serial must be currently assigned to the order.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Serial Number (Replacement)</label>
            <AdminInput
              value={newSerial}
              onChange={(e) => setNewSerial(e.target.value)}
              placeholder="e.g. SN-NEW-456"
              required
            />
            <p className="mt-1 text-xs text-slate-500">This serial must be currently InStock.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <AdminButton type="button" variant="secondary" onClick={() => setIsExchangeModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={processingId === selectedRequest?.id}>
              Confirm Exchange
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
