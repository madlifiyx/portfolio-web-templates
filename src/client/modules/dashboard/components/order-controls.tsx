import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'

export const OrderControls = ({
  index,
  count,
  onMove,
}: {
  index: number
  count: number
  onMove: (direction: -1 | 1) => void
}) => (
  <fieldset className="flex items-center gap-1" aria-label={`Position ${index + 1} of ${count}`}>
    <button
      type="button"
      disabled={index === 0}
      onClick={() => onMove(-1)}
      className="grid size-9 place-items-center rounded-md border disabled:opacity-30"
      aria-label="Move up"
    >
      <IconArrowUp size={16} />
    </button>
    <button
      type="button"
      disabled={index === count - 1}
      onClick={() => onMove(1)}
      className="grid size-9 place-items-center rounded-md border disabled:opacity-30"
      aria-label="Move down"
    >
      <IconArrowDown size={16} />
    </button>
  </fieldset>
)
