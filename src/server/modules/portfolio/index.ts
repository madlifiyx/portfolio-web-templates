import type { SQL } from 'bun'
import type { Environment } from '../../shared/config/environment'
import { apiError, assertOrigin, json, readJson, safeHandler } from '../../shared/http'
import type { AuthService } from '../auth/service'
import { readDraft, readPublished, replaceDraft } from './repository'
import { parsePortfolioDraft } from './schema'
import { publishDraft } from './service'

const requireSession = async (request: Request, auth: AuthService): Promise<Response | null> => {
  const session = await auth.authenticate(request)
  return session ? null : apiError('unauthenticated', 'Authentication required', 401)
}

export const createPortfolioRoutes = (
  database: SQL,
  environment: Environment,
  auth: AuthService,
): Record<string, unknown> => ({
  '/api/portfolio': {
    GET: safeHandler(async (request: Request) => {
      const portfolio = await readPublished(database)
      if (!portfolio) return apiError('not_found', 'Published portfolio not found', 404)
      const etag = `"portfolio-${portfolio.version}"`
      if (request.headers.get('if-none-match') === etag)
        return new Response(null, { status: 304, headers: { ETag: etag } })
      return json(portfolio, 200, { ETag: etag })
    }),
  },
  '/api/dashboard/portfolio': {
    GET: safeHandler(async (request: Request) => {
      const denied = await requireSession(request, auth)
      if (denied) return denied
      const portfolio = await readDraft(database)
      return portfolio ? json(portfolio) : apiError('not_found', 'Draft portfolio not found', 404)
    }),
    PUT: safeHandler(async (request: Request) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await replaceDraft(database, parsePortfolioDraft(await readJson(request)))
      const portfolio = await readDraft(database)
      return json(portfolio)
    }),
  },
  '/api/dashboard/publish': {
    POST: safeHandler(async (request: Request) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      return json(await publishDraft(database))
    }),
  },
})
