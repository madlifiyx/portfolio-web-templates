import { IconChevronDown } from '@tabler/icons-react'
import type { SelectHTMLAttributes } from 'react'
import { controlClass } from './form-field'

export const SelectControl = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <span className="relative block">
    <select
      {...props}
      className={`${controlClass} appearance-none pl-3 pr-10 ${props.className ?? ''}`}
    />
    <IconChevronDown
      aria-hidden="true"
      size={17}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
    />
  </span>
)
