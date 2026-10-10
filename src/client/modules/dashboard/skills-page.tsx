import { useState } from 'react'
import { saveDraft } from './api'
import { controlClass } from './components/form-field'
import { OrderControls } from './components/order-controls'
import { useDashboard } from './dashboard-context'
import { useUnsavedChanges } from './use-unsaved-changes'

export const SkillsPage = () => {
  const { draft, applyAggregate } = useDashboard()
  const [working, setWorking] = useState<string[] | null>(null)
  const [skill, setSkill] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  useUnsavedChanges(working !== null)
  if (!draft) return null
  const skills = working ?? draft.technologies
  const move = (index: number, direction: -1 | 1) => {
    const next = [...skills]
    const target = index + direction
    ;[next[index], next[target]] = [next[target], next[index]]
    setWorking(next)
  }
  const save = async () => {
    setPending(true)
    setMessage('')
    try {
      applyAggregate(await saveDraft({ ...draft, technologies: skills }))
      setWorking(null)
      setMessage('Skills saved')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setPending(false)
    }
  }
  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
          Capabilities
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Skills</h1>
        <p className="mt-1 text-sm text-slate-500">
          Technologies shown as ordered badges on your portfolio.
        </p>
      </header>
      <div className="space-y-2">
        {skills.map((name, index) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border p-3">
            <span className="flex-1 font-medium">{name}</span>
            <OrderControls
              index={index}
              count={skills.length}
              onMove={(direction) => move(index, direction)}
            />
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm text-red-600"
              aria-label={`Remove ${name}`}
              onClick={() => setWorking(skills.filter((item) => item !== name))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <form
        className="mt-5 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const value = skill.trim()
          if (!value || skills.some((item) => item.toLowerCase() === value.toLowerCase())) return
          setWorking([...skills, value])
          setSkill('')
        }}
      >
        <input
          className={controlClass}
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
          placeholder="Add technology"
          aria-label="Technology name"
        />
        <button type="submit" className="rounded-lg border px-4 text-sm font-semibold">
          Add
        </button>
      </form>
      <footer className="mt-8 flex items-center justify-end gap-3 border-t pt-5">
        <span role="status" className="mr-auto text-sm text-slate-500">
          {message}
        </span>
        {working && (
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm"
            onClick={() => setWorking(null)}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={!working || pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          onClick={save}
        >
          {pending ? 'Saving skills…' : 'Save skills'}
        </button>
      </footer>
    </>
  )
}
