import { type ChangeEvent, useState } from 'react'
import type { AssetReference } from '../../../../shared/types/portfolio'
import { uploadAsset } from '../api'

export type UploadCategory =
  | 'profile-avatar'
  | 'profile-resume'
  | 'experiences'
  | 'projects'
  | 'contacts'

export const AssetField = ({
  label,
  value,
  category,
  accept,
  hint,
  onChange,
}: {
  label: string
  value: AssetReference | null
  category: UploadCategory
  accept: string
  hint: string
  onChange: (asset: AssetReference | null) => void
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      onChange(await uploadAsset(file, category))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }
  return (
    <fieldset className="space-y-3 rounded-xl border border-dashed p-4">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="flex items-center gap-3">
        {value?.contentType.startsWith('image/') ? (
          <img
            src={`/api/dashboard/media/${value.id}`}
            alt=""
            className="size-14 rounded-lg border object-cover"
          />
        ) : (
          <div className="grid size-14 place-items-center rounded-lg bg-slate-100 text-xs dark:bg-slate-800">
            {value ? 'FILE' : 'EMPTY'}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{value?.filename ?? 'No file selected'}</p>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900">
          {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={uploading}
            onChange={upload}
          />
        </label>
        {value && (
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => onChange(null)}
          >
            Remove
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  )
}
