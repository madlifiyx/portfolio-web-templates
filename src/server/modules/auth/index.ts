import type { SQL } from 'bun'
import type { Environment } from '../../shared/config/environment'
import { apiError, assertOrigin, json, readJson, safeHandler } from '../../shared/http'
import { parseLoginInput } from './schema'
import { type AuthService, createAuthService, readSessionToken } from './service'

export const createAuthModule = (
  database: SQL,
  environment: Environment,
): { routes: Record<string, unknown>; service: AuthService } => {
  const service = createAuthService(database, environment)
  const attempts = new Map<string, { count: number; resetAt: number }>()

  return {
    service,
    routes: {
      '/api/auth/login': {
        POST: safeHandler(async (request: Request) => {
          assertOrigin(request, environment.appOrigin)
          const input = parseLoginInput(await readJson(request))
          const key = input.email
          const now = Date.now()
          const attempt = attempts.get(key)
          if (attempt && attempt.resetAt > now && attempt.count >= 5) {
            return apiError('rate_limited', 'Try again later', 429)
          }
          try {
            const result = await service.login(input.email, input.password)
            attempts.delete(key)
            return json({ authenticated: true }, 200, { 'Set-Cookie': result.cookie })
          } catch (error) {
            const current = attempt && attempt.resetAt > now ? attempt.count : 0
            attempts.set(key, { count: current + 1, resetAt: now + 15 * 60 * 1000 })
            throw error
          }
        }),
      },
      '/api/auth/logout': {
        POST: safeHandler(async (request: Request) => {
          assertOrigin(request, environment.appOrigin)
          const cookie = await service.logout(readSessionToken(request))
          return json({ authenticated: false }, 200, { 'Set-Cookie': cookie })
        }),
      },
      '/api/auth/session': {
        GET: safeHandler(async (request: Request) => {
          const session = await service.authenticate(request)
          if (!session) return apiError('unauthenticated', 'Authentication required', 401)
          return json({ authenticated: true, user: { email: session.email } })
        }),
      },
    },
  }
}
