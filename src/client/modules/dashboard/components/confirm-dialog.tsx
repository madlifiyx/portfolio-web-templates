export const confirmDelete = (name: string): boolean =>
  confirm(`Delete “${name}”?\n\nThis removes it from the draft.`)
