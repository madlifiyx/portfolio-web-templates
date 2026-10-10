import { useEffect, useState } from 'react'
import { deleteAsset, getAssets, uploadAsset } from './api'
import { controlClass, FormField } from './components/form-field'
import { SelectControl } from './components/select-field'

const Header = ({ title, description }: { title: string; description: string }) => (
  <header className="mb-6">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-sm text-muted-foreground">{description}</p>
  </header>
)
export const MediaPage = () => {
  const [message, setMessage] = useState('')
  const [assets, setAssets] = useState<Awaited<ReturnType<typeof getAssets>>>([])
  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => undefined)
  }, [])
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const file = form.get('file')
    if (!(file instanceof File)) return
    try {
      const asset = await uploadAsset(file, String(form.get('category') ?? 'uploads'))
      setAssets((current) => [asset, ...current])
      setMessage(`Uploaded ${asset.filename}: ${asset.url}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    }
  }
  return (
    <>
      <Header
        title="Asset library"
        description="Maintenance surface for reusable files. Prefer uploading from the form that uses the asset."
      />
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <FormField label="Category">
          {({ id }) => (
            <SelectControl id={id} name="category">
              <option value="profile-avatar">Profile avatar</option>
              <option value="profile-resume">Resume</option>
              <option value="projects">Project</option>
              <option value="experiences">Experience logo</option>
              <option value="contacts">Contact icon</option>
            </SelectControl>
          )}
        </FormField>
        <FormField label="File">
          {({ id }) => (
            <input
              id={id}
              name="file"
              type="file"
              required
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className={controlClass}
            />
          )}
        </FormField>
        <button
          className="min-h-11 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
          type="submit"
        >
          Upload
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm" role="status">
          {message}
        </p>
      )}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {assets.map((asset) => (
          <li key={asset.id} className="rounded-xl border p-4 text-sm">
            <a
              href={`/api/dashboard/media/${asset.id}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:underline"
            >
              {asset.filename}
            </a>
            <p className="text-muted-foreground">{asset.contentType}</p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-red-600"
              onClick={async () => {
                if (!confirm(`Delete “${asset.filename}”?`)) return
                try {
                  await deleteAsset(asset.id)
                  setAssets((current) => current.filter((item) => item.id !== asset.id))
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : 'Delete failed')
                }
              }}
            >
              Delete unused asset
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
