import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '../ui/button'

interface ActionDropdownItem {
  label: string
  icon?: ReactNode
  destructive?: boolean
  onSelect: () => void
}

export function ActionDropdown({ items }: { items: ActionDropdownItem[] }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          className="z-50 min-w-[180px] rounded-2xl border border-[#e9e3dd] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              onSelect={item.onSelect}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm outline-none transition ${
                item.destructive
                  ? 'text-[#dc2626] hover:bg-[#fef2f2]'
                  : 'text-slate-700 hover:bg-[#fff7ed]'
              }`}
            >
              {item.icon}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
