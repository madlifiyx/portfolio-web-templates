import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import type { PortfolioAggregate, PortfolioDraftInput } from '../../../shared/types/portfolio'
import { getDraft, saveDraft } from './api'

type DashboardState = {
  draft: PortfolioDraftInput | null
  loading: boolean
  saving: boolean
  message: string
  setDraft: (draft: PortfolioDraftInput) => void
  applyAggregate: (aggregate: PortfolioAggregate) => void
  save: () => Promise<void>
  reload: () => Promise<void>
}

const DashboardContext = createContext<DashboardState | null>(null)

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<PortfolioDraftInput | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const reload = async () => {
    setLoading(true)
    try {
      const aggregate = await getDraft()
      const { version, ...input } = aggregate
      setDraft({ ...input, expectedVersion: version })
      setMessage('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load draft')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    getDraft()
      .then((aggregate) => {
        const { version, ...input } = aggregate
        setDraft({ ...input, expectedVersion: version })
        setMessage('')
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Failed to load draft')
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const aggregate = await saveDraft(draft)
      const { version, ...input } = aggregate
      setDraft({ ...input, expectedVersion: version })
      setMessage('Draft saved')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const applyAggregate = (aggregate: PortfolioAggregate) => {
    const { version, ...input } = aggregate
    setDraft({ ...input, expectedVersion: version })
    setMessage('')
  }

  return (
    <DashboardContext.Provider
      value={{ draft, loading, saving, message, setDraft, applyAggregate, save, reload }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = (): DashboardState => {
  const context = useContext(DashboardContext)
  if (!context) throw new Error('useDashboard must be used within DashboardProvider')
  return context
}
