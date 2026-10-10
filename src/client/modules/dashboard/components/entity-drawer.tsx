import { IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'

export const EntityDrawer = ({
  title,
  open,
  onClose,
  children,
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[2px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 w-full overflow-y-auto border-l bg-background shadow-2xl sm:max-w-xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close editor"
          >
            <IconX size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}
