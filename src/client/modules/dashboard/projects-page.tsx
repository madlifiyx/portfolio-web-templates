import { useState } from 'react'
import type { Project } from '../../../shared/types/portfolio'
import { createProject, deleteProject, reorderProjects, saveProject } from './api'
import { AssetField } from './components/asset-field'
import { confirmDelete } from './components/confirm-dialog'
import { EntityDrawer } from './components/entity-drawer'
import { controlClass, FormField } from './components/form-field'
import { OrderControls } from './components/order-controls'
import { SelectControl } from './components/select-field'
import { useDashboard } from './dashboard-context'
import { useUnsavedChanges } from './use-unsaved-changes'

const emptyProject = (): Project => ({
  id: '',
  title: '',
  description: '',
  projectDate: null,
  image: null,
  clientName: '',
  projectType: '',
  projectRole: '',
  sortOrder: 0,
  technologies: [],
  links: [],
})

export const ProjectsPage = () => {
  const { draft, applyAggregate } = useDashboard()
  const [editing, setEditing] = useState<Project | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  useUnsavedChanges(editing !== null)
  if (!draft) return null
  const platforms = draft.platforms.filter((platform) => platform.isActive)
  const persist = async () => {
    if (!editing) return
    setPending(true)
    setError('')
    const input = {
      expectedVersion: draft.expectedVersion,
      title: editing.title,
      description: editing.description,
      projectDate: editing.projectDate,
      image: editing.image,
      clientName: editing.clientName,
      projectType: editing.projectType,
      projectRole: editing.projectRole,
      technologies: editing.technologies,
      links: editing.links,
    }
    try {
      applyAggregate(editing.id ? await saveProject(editing.id, input) : await createProject(input))
      setEditing(null)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Save failed')
    } finally {
      setPending(false)
    }
  }
  const move = async (index: number, direction: -1 | 1) => {
    const ordered = [...draft.projects]
    const target = index + direction
    ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
    applyAggregate(
      await reorderProjects({
        expectedVersion: draft.expectedVersion,
        ids: ordered.map((item) => item.id),
      }),
    )
  }
  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Selected work
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Show outcomes, technologies, and every relevant link.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyProject())}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Add project
        </button>
      </header>
      <div className="space-y-3">
        {draft.projects.map((project, index) => (
          <article key={project.id} className="flex items-center gap-4 rounded-xl border p-4">
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {project.image ? (
                <img src={project.image.url} alt="" className="size-full object-cover" />
              ) : (
                project.title.slice(0, 1)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-bold">{project.title}</h2>
              <p className="truncate text-sm text-slate-500">
                {project.projectRole || 'No role'} · {project.projectType || 'No type'} ·{' '}
                {project.technologies.length} technologies · {project.links.length} links
              </p>
            </div>
            <OrderControls
              index={index}
              count={draft.projects.length}
              onMove={(direction) => move(index, direction)}
            />
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
              onClick={() => setEditing(project)}
            >
              Edit
            </button>
          </article>
        ))}
      </div>
      <EntityDrawer
        title={`${editing?.id ? 'Edit' : 'Add'} project`}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <div className="space-y-5 p-5">
            <FormField label="Title">
              {({ id }) => (
                <input
                  id={id}
                  className={controlClass}
                  value={editing.title}
                  onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                />
              )}
            </FormField>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Date">
                {({ id }) => (
                  <input
                    id={id}
                    type="date"
                    className={controlClass}
                    value={editing.projectDate ?? ''}
                    onChange={(event) =>
                      setEditing({ ...editing, projectDate: event.target.value || null })
                    }
                  />
                )}
              </FormField>
              <FormField label="Client or company">
                {({ id }) => (
                  <input
                    id={id}
                    className={controlClass}
                    value={editing.clientName}
                    onChange={(event) => setEditing({ ...editing, clientName: event.target.value })}
                  />
                )}
              </FormField>
              <FormField label="Type">
                {({ id }) => (
                  <input
                    id={id}
                    className={controlClass}
                    value={editing.projectType}
                    onChange={(event) =>
                      setEditing({ ...editing, projectType: event.target.value })
                    }
                  />
                )}
              </FormField>
              <FormField label="Role">
                {({ id }) => (
                  <input
                    id={id}
                    className={controlClass}
                    value={editing.projectRole}
                    onChange={(event) =>
                      setEditing({ ...editing, projectRole: event.target.value })
                    }
                  />
                )}
              </FormField>
            </div>
            <AssetField
              label="Project image"
              value={editing.image}
              category="projects"
              accept="image/png,image/jpeg,image/webp"
              hint="PNG, JPEG, or WebP · max 10 MB"
              onChange={(image) => setEditing({ ...editing, image })}
            />
            <FormField label="Technologies" hint="Separate names with commas.">
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  className={controlClass}
                  value={editing.technologies.join(', ')}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      technologies: event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              )}
            </FormField>
            <fieldset className="space-y-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Links</legend>
              {editing.links.map((link, index) => (
                <div
                  key={`${link.platformKey}-${link.sortOrder}`}
                  className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
                >
                  <SelectControl
                    value={link.platformKey}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        links: editing.links.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                platformKey: event.target.value,
                                label:
                                  platforms.find((platform) => platform.key === event.target.value)
                                    ?.name ?? item.label,
                              }
                            : item,
                        ),
                      })
                    }
                  >
                    {platforms.map((platform) => (
                      <option key={platform.id} value={platform.key}>
                        {platform.name}
                      </option>
                    ))}
                  </SelectControl>
                  <input
                    className={controlClass}
                    placeholder="https://"
                    value={link.url}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        links: editing.links.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, url: event.target.value } : item,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="rounded-lg px-3 text-sm text-red-600"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        links: editing.links
                          .filter((_, itemIndex) => itemIndex !== index)
                          .map((item, sortOrder) => ({ ...item, sortOrder })),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={!platforms[0]}
                className="rounded-lg border px-3 py-2 text-sm"
                onClick={() => {
                  const platform = platforms[0]
                  if (platform)
                    setEditing({
                      ...editing,
                      links: [
                        ...editing.links,
                        {
                          platformKey: platform.key,
                          label: platform.name,
                          url: '',
                          sortOrder: editing.links.length,
                        },
                      ],
                    })
                }}
              >
                Add link
              </button>
            </fieldset>
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
                      if (!confirmDelete(editing.title)) return
                      applyAggregate(await deleteProject(editing.id, draft.expectedVersion))
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
