import { IconBriefcase, IconSchool } from '@tabler/icons-react'
import { useState } from 'react'
import type { Experience } from '../../../shared/types/portfolio'
import { createExperience, deleteExperience, reorderExperiences, saveExperience } from './api'
import { AssetField } from './components/asset-field'
import { confirmDelete } from './components/confirm-dialog'
import { EntityDrawer } from './components/entity-drawer'
import { controlClass, FormField } from './components/form-field'
import { OrderControls } from './components/order-controls'
import { SelectControl } from './components/select-field'
import { useDashboard } from './dashboard-context'
import { useUnsavedChanges } from './use-unsaved-changes'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 80 }, (_, index) => currentYear + 5 - index)

const emptyExperience = (kind: Experience['kind']): Experience => ({
  id: '',
  kind,
  organization: '',
  roleOrProgram: '',
  websiteUrl: '',
  logo: null,
  startYear: currentYear,
  startMonth: null,
  endYear: null,
  endMonth: null,
  isCurrent: true,
  description: '',
  sortOrder: 0,
})

const formatPeriod = (value: Experience) => {
  const startMonth = value.startMonth ? `${months[value.startMonth - 1].slice(0, 3)} ` : ''
  const start = `${startMonth}${value.startYear}`
  const end = value.isCurrent
    ? 'Present'
    : value.endYear
      ? `${value.endMonth ? `${months[value.endMonth - 1].slice(0, 3)} ` : ''}${value.endYear}`
      : 'Not set'
  return `${start} – ${end}`
}

export const ExperiencePage = () => {
  const { draft, applyAggregate } = useDashboard()
  const [tab, setTab] = useState<Experience['kind']>('work')
  const [editing, setEditing] = useState<Experience | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  useUnsavedChanges(editing !== null)
  if (!draft) return null
  const items = draft.experiences.filter((item) => item.kind === tab)

  const persist = async () => {
    if (!editing) return
    setPending(true)
    setError('')
    try {
      const input = {
        expectedVersion: draft.expectedVersion,
        kind: editing.kind,
        organization: editing.organization,
        roleOrProgram: editing.roleOrProgram,
        websiteUrl: editing.websiteUrl,
        logo: editing.logo,
        startYear: editing.startYear,
        startMonth: editing.startMonth,
        endYear: editing.isCurrent ? null : editing.endYear,
        endMonth: editing.isCurrent ? null : editing.endMonth,
        isCurrent: editing.isCurrent,
        description: editing.description,
      }
      applyAggregate(
        editing.id ? await saveExperience(editing.id, input) : await createExperience(input),
      )
      setEditing(null)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Save failed')
    } finally {
      setPending(false)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const ordered = [...items]
    const target = index + direction
    ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
    const other = draft.experiences.filter((item) => item.kind !== tab)
    applyAggregate(
      await reorderExperiences({
        expectedVersion: draft.expectedVersion,
        ids: [...ordered, ...other].map((item) => item.id),
      }),
    )
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Career timeline
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Experience</h1>
          <p className="mt-1 text-sm text-slate-500">
            Work history and education, ordered for your public portfolio.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyExperience(tab))}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Add {tab === 'work' ? 'work' : 'education'}
        </button>
      </header>
      <div
        className="mb-6 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900"
        role="tablist"
      >
        {(['work', 'education'] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={tab === kind}
            onClick={() => setTab(kind)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === kind ? 'bg-background shadow-sm' : 'text-slate-500'}`}
          >
            {kind === 'work' ? <IconBriefcase size={17} /> : <IconSchool size={17} />}
            {kind === 'work' ? 'Work' : 'Education'} (
            {draft.experiences.filter((item) => item.kind === kind).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-slate-500">
            No {tab === 'work' ? 'work history' : 'education'} yet.
          </div>
        )}
        {items.map((item, index) => (
          <article
            key={item.id}
            className="flex items-center gap-4 rounded-xl border p-4 transition hover:border-slate-300"
          >
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {item.logo ? (
                <img src={item.logo.url} alt="" className="size-full object-cover" />
              ) : (
                item.organization.slice(0, 1)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-bold">{item.organization}</h2>
              <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                {item.roleOrProgram} · {formatPeriod(item)}
              </p>
            </div>
            <OrderControls
              index={index}
              count={items.length}
              onMove={(direction) => move(index, direction)}
            />
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
              onClick={() => setEditing(item)}
            >
              Edit
            </button>
          </article>
        ))}
      </div>

      <EntityDrawer
        title={`${editing?.id ? 'Edit' : 'Add'} ${tab === 'work' ? 'work experience' : 'education'}`}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <div className="space-y-5 p-5">
            <FormField label={tab === 'work' ? 'Organization' : 'School or institution'}>
              {({ id }) => (
                <input
                  id={id}
                  className={controlClass}
                  value={editing.organization}
                  onChange={(event) => setEditing({ ...editing, organization: event.target.value })}
                />
              )}
            </FormField>
            <FormField label={tab === 'work' ? 'Role' : 'Program or degree'}>
              {({ id }) => (
                <input
                  id={id}
                  className={controlClass}
                  value={editing.roleOrProgram}
                  onChange={(event) =>
                    setEditing({ ...editing, roleOrProgram: event.target.value })
                  }
                />
              )}
            </FormField>
            <FormField label="Website" hint="Use a full https:// URL.">
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  className={controlClass}
                  value={editing.websiteUrl}
                  onChange={(event) => setEditing({ ...editing, websiteUrl: event.target.value })}
                />
              )}
            </FormField>
            <AssetField
              label={tab === 'work' ? 'Company logo' : 'Institution logo'}
              value={editing.logo}
              category="experiences"
              accept="image/png,image/jpeg,image/webp"
              hint="PNG, JPEG, or WebP · max 5 MB"
              onChange={(logo) => setEditing({ ...editing, logo })}
            />
            <fieldset className="space-y-4 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Date range</legend>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Start month">
                  {({ id }) => (
                    <SelectControl
                      id={id}
                      value={editing.startMonth ?? ''}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          startMonth: event.target.value ? Number(event.target.value) : null,
                        })
                      }
                    >
                      <option value="">Month</option>
                      {months.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </SelectControl>
                  )}
                </FormField>
                <FormField label="Start year">
                  {({ id }) => (
                    <SelectControl
                      id={id}
                      value={editing.startYear}
                      onChange={(event) =>
                        setEditing({ ...editing, startYear: Number(event.target.value) })
                      }
                    >
                      {years.map((year) => (
                        <option key={year}>{year}</option>
                      ))}
                    </SelectControl>
                  )}
                </FormField>
              </div>
              <label className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900">
                <input
                  type="checkbox"
                  checked={editing.isCurrent}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      isCurrent: event.target.checked,
                      endMonth: null,
                      endYear: null,
                    })
                  }
                />
                I currently {tab === 'work' ? 'work' : 'study'} here
              </label>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="End month">
                  {({ id }) => (
                    <SelectControl
                      id={id}
                      disabled={editing.isCurrent}
                      value={editing.endMonth ?? ''}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          endMonth: event.target.value ? Number(event.target.value) : null,
                        })
                      }
                    >
                      <option value="">Month</option>
                      {months.map((month, index) => (
                        <option key={month} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </SelectControl>
                  )}
                </FormField>
                <FormField label="End year">
                  {({ id }) => (
                    <SelectControl
                      id={id}
                      disabled={editing.isCurrent}
                      value={editing.endYear ?? ''}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          endYear: event.target.value ? Number(event.target.value) : null,
                        })
                      }
                    >
                      <option value="">Year</option>
                      {years.map((year) => (
                        <option key={year}>{year}</option>
                      ))}
                    </SelectControl>
                  )}
                </FormField>
              </div>
            </fieldset>
            <FormField label="Description">
              {({ id }) => (
                <textarea
                  id={id}
                  rows={5}
                  className={controlClass}
                  value={editing.description}
                  onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                />
              )}
            </FormField>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <footer className="sticky bottom-0 -mx-5 flex items-center justify-between border-t bg-background px-5 py-4">
              <div>
                {editing.id && (
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-600"
                    onClick={async () => {
                      if (!confirmDelete(editing.organization)) return
                      applyAggregate(await deleteExperience(editing.id, draft.expectedVersion))
                      setEditing(null)
                    }}
                  >
                    Delete…
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={pending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  onClick={persist}
                >
                  {pending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </footer>
          </div>
        )}
      </EntityDrawer>
    </>
  )
}
