import * as AlertDialog from '@radix-ui/react-alert-dialog'
import type { ReactNode } from 'react'
import { Button } from '../ui/button'

interface ConfirmDialogProps {
  title: string
  description: string
  trigger: ReactNode
  confirmLabel?: string
  onConfirm: () => Promise<void> | void
}

export function ConfirmDialog({
  title,
  description,
  trigger,
  confirmLabel = 'Confirm',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[#ece6de] bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.18)]">
          <AlertDialog.Title className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-sm leading-7 text-slate-500">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={() => void onConfirm()}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
