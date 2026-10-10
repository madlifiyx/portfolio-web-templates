import { useState } from 'react'
import { publish } from './api'
import { useDashboard } from './dashboard-context'

const Header = ({ title, description }: { title: string; description: string }) => (
  <header className="mb-6">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-sm text-muted-foreground">{description}</p>
  </header>
)

export const OverviewPage = () => {
  const { draft, loading, reload } = useDashboard()
  const [message, setMessage] = useState('')
  const [publishing, setPublishing] = useState(false)
  if (loading || !draft) return <p>Loading draft...</p>
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Private CMS</p>
      <Header
        title="Dashboard"
        description="Manage a private draft, preview it, then publish the complete portfolio."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <strong className="text-3xl">{draft.projects.length}</strong>
          <p className="text-sm">Projects</p>
        </div>
        <div className="rounded-xl border p-5">
          <strong className="text-3xl">{draft.experiences.length}</strong>
          <p className="text-sm">Experiences</p>
        </div>
        <div className="rounded-xl border p-5">
          <strong className="text-3xl">{draft.contacts.length}</strong>
          <p className="text-sm">Contacts</p>
        </div>
      </div>
      <button
        type="button"
        disabled={publishing}
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
        onClick={() => {
          if (!confirm('Publish this complete draft to the public portfolio?')) return
          setPublishing(true)
          publish()
            .then((result) => {
              setMessage(`Published version ${result.publishedVersion}`)
              reload()
            })
            .catch((error) => setMessage(error instanceof Error ? error.message : 'Publish failed'))
            .finally(() => setPublishing(false))
        }}
      >
        {publishing ? 'Publishing...' : 'Publish draft'}
      </button>
      {message && (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      )}
    </>
  )
}
