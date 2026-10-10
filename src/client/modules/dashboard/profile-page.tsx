import { useState } from 'react'
import type { Profile } from '../../../shared/types/portfolio'
import { saveProfile } from './api'
import { AssetField } from './components/asset-field'
import { controlClass, FormField } from './components/form-field'
import { useDashboard } from './dashboard-context'
import { useUnsavedChanges } from './use-unsaved-changes'

export const ProfilePage = () => {
  const { draft, applyAggregate } = useDashboard()
  const [form, setForm] = useState<Profile | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  useUnsavedChanges(form !== null)
  if (!draft) return null
  const value = form ?? draft.profile
  const update = <Key extends keyof Profile>(key: Key, next: Profile[Key]) =>
    setForm({ ...value, [key]: next })
  const save = async () => {
    if (!draft.profile.id) return
    setPending(true)
    setMessage('')
    try {
      applyAggregate(
        await saveProfile(draft.profile.id, {
          expectedVersion: draft.expectedVersion,
          name: value.name,
          pronouns: value.pronouns,
          headline: value.headline,
          about: value.about,
          avatar: value.avatar,
          resume: value.resume,
        }),
      )
      setForm(null)
      setMessage('Profile saved')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setPending(false)
    }
  }
  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Identity</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">The introduction visitors see first.</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name">
          {({ id }) => (
            <input
              id={id}
              className={controlClass}
              value={value.name}
              onChange={(event) => update('name', event.target.value)}
            />
          )}
        </FormField>
        <FormField label="Pronouns">
          {({ id }) => (
            <input
              id={id}
              className={controlClass}
              value={value.pronouns}
              onChange={(event) => update('pronouns', event.target.value)}
            />
          )}
        </FormField>
        <FormField label="Headline">
          {({ id }) => (
            <input
              id={id}
              className={controlClass}
              value={value.headline}
              onChange={(event) => update('headline', event.target.value)}
            />
          )}
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="About">
            {({ id }) => (
              <textarea
                id={id}
                rows={6}
                className={controlClass}
                value={value.about}
                onChange={(event) => update('about', event.target.value)}
              />
            )}
          </FormField>
        </div>
        <AssetField
          label="Avatar"
          value={value.avatar}
          category="profile-avatar"
          accept="image/png,image/jpeg,image/webp"
          hint="PNG, JPEG, or WebP · max 5 MB"
          onChange={(asset) => update('avatar', asset)}
        />
        <AssetField
          label="Resume"
          value={value.resume}
          category="profile-resume"
          accept="application/pdf"
          hint="PDF · max 10 MB"
          onChange={(asset) => update('resume', asset)}
        />
      </div>
      <footer className="mt-8 flex items-center justify-end gap-3 border-t pt-5">
        <span role="status" className="mr-auto text-sm text-slate-500">
          {message}
        </span>
        {form && (
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm"
            onClick={() => setForm(null)}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={!form || pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          onClick={save}
        >
          {pending ? 'Saving profile…' : 'Save profile'}
        </button>
      </footer>
    </>
  )
}
