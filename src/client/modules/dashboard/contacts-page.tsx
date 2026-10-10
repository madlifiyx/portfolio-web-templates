import { IconEye, IconEyeOff, IconLink } from '@tabler/icons-react'
import { useState } from 'react'
import type { Contact } from '../../../shared/types/portfolio'
import { createContact, deleteContact, reorderContacts, saveContact } from './api'
import { AssetField } from './components/asset-field'
import { confirmDelete } from './components/confirm-dialog'
import { EntityDrawer } from './components/entity-drawer'
import { controlClass, FormField } from './components/form-field'
import { OrderControls } from './components/order-controls'
import { SelectControl } from './components/select-field'
import { useDashboard } from './dashboard-context'
import { useUnsavedChanges } from './use-unsaved-changes'

const emptyContact = (platformKey: string): Contact => ({
  id: '',
  platformKey,
  labelOverride: null,
  label: '',
  url: '',
  iconOverride: null,
  icon: null,
  sortOrder: 0,
  isVisible: true,
})

export const ContactsPage = () => {
  const { draft, applyAggregate } = useDashboard()
  const [editing, setEditing] = useState<Contact | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  useUnsavedChanges(editing !== null)
  if (!draft) return null
  const platforms = draft.platforms.filter((platform) => platform.isActive)
  const resolvedPlatform = editing
    ? draft.platforms.find((platform) => platform.key === editing.platformKey)
    : null

  const persist = async () => {
    if (!editing) return
    setPending(true)
    setError('')
    const input = {
      expectedVersion: draft.expectedVersion,
      platformKey: editing.platformKey,
      labelOverride: editing.labelOverride?.trim() || null,
      url: editing.url,
      iconOverride: editing.iconOverride ?? null,
      isVisible: editing.isVisible,
    }
    try {
      applyAggregate(editing.id ? await saveContact(editing.id, input) : await createContact(input))
      setEditing(null)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Save failed')
    } finally {
      setPending(false)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const ordered = [...draft.contacts]
    const target = index + direction
    ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
    applyAggregate(
      await reorderContacts({
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
            Public links
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Start from a platform suggestion, then customize only what you need.
          </p>
        </div>
        <button
          type="button"
          disabled={platforms.length === 0}
          onClick={() => setEditing(emptyContact(platforms[0]?.key ?? 'custom'))}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add contact
        </button>
      </header>
      <div className="space-y-3">
        {draft.contacts.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-slate-500">
            No contacts yet.
          </div>
        )}
        {draft.contacts.map((contact, index) => (
          <article key={contact.id} className="flex items-center gap-4 rounded-xl border p-4">
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {contact.icon ? (
                <img src={contact.icon.url} alt="" className="size-7 object-contain" />
              ) : (
                <IconLink size={20} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-bold">{contact.label}</h2>
                {contact.isVisible ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <IconEye size={14} />
                    Visible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <IconEyeOff size={14} />
                    Hidden
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-slate-500">{contact.url}</p>
            </div>
            <OrderControls
              index={index}
              count={draft.contacts.length}
              onMove={(direction) => move(index, direction)}
            />
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
              onClick={() => setEditing(contact)}
            >
              Edit
            </button>
          </article>
        ))}
      </div>

      <EntityDrawer
        title={`${editing?.id ? 'Edit' : 'Add'} contact`}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <div className="space-y-5 p-5">
            <FormField label="Platform" hint="Suggestions provide a default name and icon.">
              {({ id, describedBy }) => (
                <SelectControl
                  id={id}
                  aria-describedby={describedBy}
                  value={editing.platformKey}
                  onChange={(event) => setEditing({ ...editing, platformKey: event.target.value })}
                >
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.key}>
                      {platform.name}
                    </option>
                  ))}
                </SelectControl>
              )}
            </FormField>
            <FormField label="URL" hint="Use https://, mailto:, or tel:.">
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  className={controlClass}
                  value={editing.url}
                  placeholder="https://github.com/username"
                  onChange={(event) => setEditing({ ...editing, url: event.target.value })}
                />
              )}
            </FormField>
            <FormField
              label="Display label"
              hint={`Leave blank to use “${resolvedPlatform?.name ?? 'platform name'}”.`}
            >
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  className={controlClass}
                  value={editing.labelOverride ?? ''}
                  onChange={(event) =>
                    setEditing({ ...editing, labelOverride: event.target.value || null })
                  }
                />
              )}
            </FormField>
            <AssetField
              label="Custom icon"
              value={editing.iconOverride ?? null}
              category="contacts"
              accept="image/png,image/webp"
              hint={
                resolvedPlatform?.defaultIcon
                  ? `Leave empty to use ${resolvedPlatform.name} default · PNG or WebP · max 1 MB`
                  : 'PNG or WebP · max 1 MB'
              }
              onChange={(iconOverride) => setEditing({ ...editing, iconOverride })}
            />
            <label className="flex items-center justify-between rounded-xl border p-4">
              <span>
                <span className="block text-sm font-semibold">Show on public portfolio</span>
                <span className="text-xs text-slate-500">
                  Hidden contacts remain in your draft.
                </span>
              </span>
              <input
                type="checkbox"
                checked={editing.isVisible}
                onChange={(event) => setEditing({ ...editing, isVisible: event.target.checked })}
              />
            </label>
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
                      if (!confirmDelete(editing.label || resolvedPlatform?.name || 'contact'))
                        return
                      applyAggregate(await deleteContact(editing.id, draft.expectedVersion))
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
