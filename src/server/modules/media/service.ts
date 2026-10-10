import { createHash } from 'node:crypto'
import type { SQL } from 'bun'
import type { Environment } from '../../shared/config/environment'
import { HttpError } from '../../shared/http'

type AssetRow = {
  id: string
  bucket: string
  object_key: string
  original_filename: string
  content_type: string
  byte_size: string
  etag: string | null
}

const POLICIES: Record<string, { types: string[]; maximum: number }> = {
  contacts: { types: ['image/png', 'image/webp'], maximum: 1024 * 1024 },
  platforms: { types: ['image/png', 'image/webp'], maximum: 1024 * 1024 },
  'profile-avatar': { types: ['image/png', 'image/jpeg', 'image/webp'], maximum: 5 * 1024 * 1024 },
  'profile-resume': { types: ['application/pdf'], maximum: 10 * 1024 * 1024 },
  experiences: { types: ['image/png', 'image/jpeg', 'image/webp'], maximum: 5 * 1024 * 1024 },
  projects: { types: ['image/png', 'image/jpeg', 'image/webp'], maximum: 10 * 1024 * 1024 },
}

const detectedContentType = (bytes: Uint8Array): string | null => {
  if (
    bytes.length >= 8 &&
    bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index])
  ) {
    return 'image/png'
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return 'image/jpeg'
  if (
    bytes.length >= 12 &&
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
  ) {
    return 'image/webp'
  }
  if (bytes.length >= 5 && new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-')
    return 'application/pdf'
  return null
}

export const validateUpload = async (
  file: File,
  category: string,
): Promise<{ bytes: Uint8Array; contentType: string; checksum: string }> => {
  const policy = POLICIES[category]
  if (!policy) throw new HttpError(422, 'validation_error', 'Asset category is invalid')
  if (!policy.types.includes(file.type))
    throw new HttpError(415, 'unsupported_media_type', `File type is not allowed for ${category}`)
  if (file.size === 0 || file.size > policy.maximum)
    throw new HttpError(413, 'file_too_large', `File is empty or exceeds ${policy.maximum} bytes`)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const contentType = detectedContentType(bytes)
  if (contentType !== file.type)
    throw new HttpError(
      415,
      'invalid_file_signature',
      'File contents do not match its content type',
    )
  return { bytes, contentType, checksum: createHash('sha256').update(bytes).digest('hex') }
}

export const createStorageClient = (environment: Environment): Bun.S3Client =>
  new Bun.S3Client({
    endpoint: environment.s3.endpoint,
    region: environment.s3.region,
    bucket: environment.s3.bucket,
    accessKeyId: environment.s3.accessKeyId,
    secretAccessKey: environment.s3.secretAccessKey,
  })

export const uploadAsset = async (
  database: SQL,
  storage: Bun.S3Client,
  environment: Environment,
  file: File,
  category: string,
): Promise<{ id: string; url: string; filename: string; contentType: string }> => {
  const validated = await validateUpload(file, category)
  const id = crypto.randomUUID()
  const extension =
    validated.contentType === 'image/jpeg' ? 'jpg' : validated.contentType.split('/')[1]
  const objectKey = `${category}/${id}.${extension}`
  await storage.write(objectKey, validated.bytes, { type: validated.contentType })
  try {
    const stat = await storage.stat(objectKey)
    await database`
      INSERT INTO assets (id, bucket, object_key, original_filename, content_type, byte_size, etag, checksum_sha256)
      VALUES (${id}, ${environment.s3.bucket}, ${objectKey}, ${file.name}, ${validated.contentType},
        ${file.size}, ${stat.etag ?? null}, ${validated.checksum})
    `
  } catch (error) {
    await storage.delete(objectKey).catch(() => undefined)
    throw error
  }
  return { id, url: `/media/${id}`, filename: file.name, contentType: validated.contentType }
}

export const uploadTrustedSeedAsset = async (
  database: SQL,
  storage: Bun.S3Client,
  environment: Environment,
  file: Blob,
  filename: string,
  contentType: string,
  category: string,
): Promise<{ id: string; url: string; filename: string; contentType: string }> => {
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes.length === 0) throw new Error(`Seed asset is empty: ${filename}`)
  const id = crypto.randomUUID()
  const extension = filename.split('.').at(-1)?.toLowerCase() ?? 'bin'
  const objectKey = `${category}/${id}.${extension}`
  const checksum = createHash('sha256').update(bytes).digest('hex')
  await storage.write(objectKey, bytes, { type: contentType })
  try {
    const stat = await storage.stat(objectKey)
    await database`
      INSERT INTO assets (id, bucket, object_key, original_filename, content_type, byte_size, etag, checksum_sha256)
      VALUES (${id}, ${environment.s3.bucket}, ${objectKey}, ${filename}, ${contentType},
        ${bytes.length}, ${stat.etag ?? null}, ${checksum})
    `
  } catch (error) {
    await storage.delete(objectKey).catch(() => undefined)
    throw error
  }
  return { id, url: `/media/${id}`, filename, contentType }
}

export const findAsset = async (
  database: SQL,
  id: string,
  includeDraft: boolean,
): Promise<AssetRow | null> => {
  const [row] = includeDraft
    ? await database<
        AssetRow[]
      >`SELECT id, bucket, object_key, original_filename, content_type, byte_size::text, etag FROM assets WHERE id = ${id}`
    : await database<AssetRow[]>`
        SELECT DISTINCT assets.id, assets.bucket, assets.object_key, assets.original_filename,
          assets.content_type, assets.byte_size::text, assets.etag
        FROM assets
        JOIN portfolio_revisions ON portfolio_revisions.status = 'published'
        WHERE assets.id = ${id} AND (
          EXISTS (SELECT 1 FROM profiles WHERE profiles.revision_id = portfolio_revisions.id
            AND (profiles.avatar_asset_id = assets.id OR profiles.resume_asset_id = assets.id)) OR
          EXISTS (SELECT 1 FROM experiences WHERE experiences.revision_id = portfolio_revisions.id
            AND experiences.logo_asset_id = assets.id) OR
          EXISTS (SELECT 1 FROM projects WHERE projects.revision_id = portfolio_revisions.id
            AND projects.image_asset_id = assets.id) OR
          EXISTS (SELECT 1 FROM platforms WHERE platforms.revision_id = portfolio_revisions.id
            AND platforms.default_icon_asset_id = assets.id) OR
          EXISTS (SELECT 1 FROM contacts WHERE contacts.revision_id = portfolio_revisions.id
            AND contacts.icon_asset_id = assets.id)
        )
      `
  return row ?? null
}

export const assetResponse = async (
  request: Request,
  asset: AssetRow,
  storage: Bun.S3Client,
): Promise<Response> => {
  const file = storage.file(asset.object_key)
  const size = Number(asset.byte_size)
  const range = request.headers.get('range')
  const headers = new Headers({
    'Content-Type': asset.content_type,
    'Content-Length': String(size),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
  })
  if (asset.etag) headers.set('ETag', asset.etag)
  if (asset.content_type === 'application/pdf') {
    headers.set(
      'Content-Disposition',
      `attachment; filename="${asset.original_filename.replace(/["\\]/g, '')}"`,
    )
  }
  if (request.method === 'HEAD') return new Response(null, { headers })
  if (!range) return new Response(file.stream(), { headers })

  const match = /^bytes=(\d+)-(\d*)$/.exec(range)
  if (!match)
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
  const start = Number(match[1])
  const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  if (start > end || start >= size)
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`)
  headers.set('Content-Length', String(end - start + 1))
  return new Response(file.slice(start, end + 1).stream(), { status: 206, headers })
}

export const deleteUnusedAsset = async (
  database: SQL,
  storage: Bun.S3Client,
  id: string,
): Promise<void> => {
  const [row] = await database<AssetRow[]>`
    SELECT id, bucket, object_key, original_filename, content_type, byte_size::text, etag FROM assets WHERE id = ${id}
  `
  if (!row) throw new HttpError(404, 'not_found', 'Asset not found')
  const [{ used }] = await database<Array<{ used: boolean }>>`
    SELECT
      EXISTS (SELECT 1 FROM profiles WHERE avatar_asset_id = ${id} OR resume_asset_id = ${id}) OR
      EXISTS (SELECT 1 FROM experiences WHERE logo_asset_id = ${id}) OR
      EXISTS (SELECT 1 FROM projects WHERE image_asset_id = ${id}) OR
      EXISTS (SELECT 1 FROM platforms WHERE default_icon_asset_id = ${id}) OR
      EXISTS (SELECT 1 FROM contacts WHERE icon_asset_id = ${id}) AS used
  `
  if (used) throw new HttpError(409, 'asset_in_use', 'Asset is still referenced')
  await storage.delete(row.object_key)
  await database`DELETE FROM assets WHERE id = ${id}`
}

export const listAssets = async (
  database: SQL,
): Promise<Array<{ id: string; url: string; filename: string; contentType: string }>> => {
  const rows = await database<
    Array<{ id: string; original_filename: string; content_type: string }>
  >`
    SELECT id, original_filename, content_type FROM assets ORDER BY created_at DESC
  `
  return rows.map((row) => ({
    id: row.id,
    url: `/media/${row.id}`,
    filename: row.original_filename,
    contentType: row.content_type,
  }))
}
