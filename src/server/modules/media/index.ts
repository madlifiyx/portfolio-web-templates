import type { SQL } from 'bun'
import type { Environment } from '../../shared/config/environment'
import { apiError, assertOrigin, json, safeHandler } from '../../shared/http'
import type { AuthService } from '../auth/service'
import {
  assetResponse,
  createStorageClient,
  deleteUnusedAsset,
  findAsset,
  listAssets,
  uploadAsset,
} from './service'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const createMediaRoutes = (
  database: SQL,
  environment: Environment,
  auth: AuthService,
): Record<string, unknown> => {
  const storage = createStorageClient(environment)
  const serve = safeHandler(async (request: Bun.BunRequest<'/media/:id'>) => {
    if (!uuidPattern.test(request.params.id)) return apiError('not_found', 'Asset not found', 404)
    const asset = await findAsset(database, request.params.id, false)
    return asset
      ? assetResponse(request, asset, storage)
      : apiError('not_found', 'Asset not found', 404)
  })

  return {
    '/media/:id': { GET: serve, HEAD: serve },
    '/api/dashboard/assets': {
      GET: safeHandler(async (request: Request) => {
        if (!(await auth.authenticate(request)))
          return apiError('unauthenticated', 'Authentication required', 401)
        return json(await listAssets(database))
      }),
      POST: safeHandler(async (request: Request) => {
        assertOrigin(request, environment.appOrigin)
        if (!(await auth.authenticate(request)))
          return apiError('unauthenticated', 'Authentication required', 401)
        const form = await request.formData()
        const file = form.get('file')
        const category = form.get('category')
        if (!(file instanceof File) || typeof category !== 'string') {
          return apiError('validation_error', 'File and category are required', 422)
        }
        return json(await uploadAsset(database, storage, environment, file, category), 201)
      }),
    },
    '/api/dashboard/assets/:id': {
      DELETE: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/assets/:id'>) => {
        assertOrigin(request, environment.appOrigin)
        if (!(await auth.authenticate(request)))
          return apiError('unauthenticated', 'Authentication required', 401)
        if (!uuidPattern.test(request.params.id))
          return apiError('not_found', 'Asset not found', 404)
        await deleteUnusedAsset(database, storage, request.params.id)
        return new Response(null, { status: 204 })
      }),
    },
    '/api/dashboard/media/:id': {
      GET: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/media/:id'>) => {
        if (!(await auth.authenticate(request)))
          return apiError('unauthenticated', 'Authentication required', 401)
        if (!uuidPattern.test(request.params.id))
          return apiError('not_found', 'Asset not found', 404)
        const asset = await findAsset(database, request.params.id, true)
        return asset
          ? assetResponse(request, asset, storage)
          : apiError('not_found', 'Asset not found', 404)
      }),
    },
  }
}
