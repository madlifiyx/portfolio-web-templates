import { useEffect } from 'react'
import { useBlocker } from 'react-router'

export const useUnsavedChanges = (active: boolean): void => {
  const blocker = useBlocker(active)

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (confirm('Discard unsaved changes?')) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  useEffect(() => {
    if (!active) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
}
