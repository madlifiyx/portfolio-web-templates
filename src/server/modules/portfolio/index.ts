import type { SQL } from 'bun'
import type { Environment } from '../../shared/config/environment'
import { apiError, assertOrigin, json, readJson, safeHandler } from '../../shared/http'
import type { AuthService } from '../auth/service'
import {
  createContact,
  createExperience,
  createProject,
  deleteDraftEntity,
  readDraft,
  readPublished,
  reorderDraftEntities,
  replaceDraft,
  updateContact,
  updateExperience,
  updateProfile,
  updateProject,
} from './repository'
import {
  parseContactDraft,
  parseDraftReorder,
  parseEntityId,
  parseExpectedVersion,
  parseExperienceDraft,
  parsePortfolioDraft,
  parseProfileDraft,
  parseProjectDraft,
} from './schema'
import { publishDraft } from './service'

const requireSession = async (request: Request, auth: AuthService): Promise<Response | null> => {
  const session = await auth.authenticate(request)
  return session ? null : apiError('unauthenticated', 'Authentication required', 401)
}

const draftResponse = async (database: SQL): Promise<Response> => {
  const draft = await readDraft(database)
  if (!draft) throw new Error('Draft revision is missing')
  return json(draft)
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
  '/api/dashboard/profile/:id': {
    PATCH: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/profile/:id'>) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await updateProfile(
        database,
        parseEntityId(request.params.id),
        parseProfileDraft(await readJson(request)),
      )
      return draftResponse(database)
    }),
  },
  '/api/dashboard/experiences': {
    POST: safeHandler(async (request: Request) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await createExperience(database, parseExperienceDraft(await readJson(request)))
      return draftResponse(database)
    }),
  },
  '/api/dashboard/experiences/reorder': {
    PUT: safeHandler(async (request: Request) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await reorderDraftEntities(
        database,
        'experiences',
        parseDraftReorder(await readJson(request)),
      )
      return draftResponse(database)
    }),
  },
  '/api/dashboard/experiences/:id': {
    PATCH: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/experiences/:id'>) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await updateExperience(
        database,
        parseEntityId(request.params.id),
        parseExperienceDraft(await readJson(request)),
      )
      return draftResponse(database)
    }),
    DELETE: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/experiences/:id'>) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await deleteDraftEntity(
        database,
        'experiences',
        parseEntityId(request.params.id),
        parseExpectedVersion(await readJson(request)),
      )
      return draftResponse(database)
    }),
  },
  '/api/dashboard/projects': {
    POST: safeHandler(async (request: Request) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await createProject(database, parseProjectDraft(await readJson(request)))
      return draftResponse(database)
    }),
  },
  '/api/dashboard/projects/reorder': {
    PUT: safeHandler(async (request: Request) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await reorderDraftEntities(database, 'projects', parseDraftReorder(await readJson(request)))
      return draftResponse(database)
    }),
  },
  '/api/dashboard/projects/:id': {
    PATCH: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/projects/:id'>) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await updateProject(
        database,
        parseEntityId(request.params.id),
        parseProjectDraft(await readJson(request)),
      )
      return draftResponse(database)
    }),
    DELETE: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/projects/:id'>) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await deleteDraftEntity(
        database,
        'projects',
        parseEntityId(request.params.id),
        parseExpectedVersion(await readJson(request)),
      )
      return draftResponse(database)
    }),
  },
  '/api/dashboard/contacts': {
    POST: safeHandler(async (request: Request) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await createContact(database, parseContactDraft(await readJson(request)))
      return draftResponse(database)
    }),
  },
  '/api/dashboard/contacts/reorder': {
    PUT: safeHandler(async (request: Request) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await reorderDraftEntities(database, 'contacts', parseDraftReorder(await readJson(request)))
      return draftResponse(database)
    }),
  },
  '/api/dashboard/contacts/:id': {
    PATCH: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/contacts/:id'>) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await updateContact(
        database,
        parseEntityId(request.params.id),
        parseContactDraft(await readJson(request)),
      )
      return draftResponse(database)
    }),
    DELETE: safeHandler(async (request: Bun.BunRequest<'/api/dashboard/contacts/:id'>) => {
      assertOrigin(request, environment.appOrigin)
      const denied = await requireSession(request, auth)
      if (denied) return denied
      await deleteDraftEntity(
        database,
        'contacts',
        parseEntityId(request.params.id),
        parseExpectedVersion(await readJson(request)),
      )
      return draftResponse(database)
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
