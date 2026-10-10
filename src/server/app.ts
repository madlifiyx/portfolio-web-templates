import { SQL } from 'bun'
import { createAuthModule } from './modules/auth'
import { createMediaRoutes } from './modules/media'
import { createPortfolioRoutes } from './modules/portfolio'
import { parseEnvironment } from './shared/config/environment'
import { apiError, json, safeHandler } from './shared/http'

export const PUBLIC_CLIENT_ROUTES = ['/', '/contact', '/project'] as const
export const DASHBOARD_CLIENT_ROUTES = [
  '/login',
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/experience',
  '/dashboard/skills',
  '/dashboard/projects',
  '/dashboard/contacts',
  '/dashboard/platforms',
  '/dashboard/media',
  '/dashboard/preview',
] as const

export type ServerApplication = {
  options: Bun.Serve.Options<undefined>
  close(): Promise<void>
}

export const createServerApplication = (index: Bun.HTMLBundle): ServerApplication => {
  const environment = parseEnvironment(process.env)
  const database = new SQL(environment.databaseUrl)
  const auth = createAuthModule(database, environment)
  const portfolioRoutes = createPortfolioRoutes(database, environment, auth.service)
  const mediaRoutes = createMediaRoutes(database, environment, auth.service)

  return {
    options: {
      port: environment.port,
      routes: {
        '/': index,
        '/contact': index,
        '/project': index,
        '/login': index,
        '/dashboard': index,
        '/dashboard/profile': index,
        '/dashboard/experience': index,
        '/dashboard/skills': index,
        '/dashboard/projects': index,
        '/dashboard/contacts': index,
        '/dashboard/platforms': index,
        '/dashboard/media': index,
        '/dashboard/preview': index,
        '/images/no-project-image.png': Bun.file('public/images/no-project-image.png'),
        '/health/live': { GET: () => json({ status: 'ok' }) },
        '/health/ready': {
          GET: safeHandler(async () => {
            await database`SELECT 1`
            try {
              const response = await fetch(`${environment.s3.endpoint}/health/ready`)
              if (!response.ok) return apiError('not_ready', 'Storage is not ready', 503)
            } catch {
              return apiError('not_ready', 'Storage is not ready', 503)
            }
            return json({ status: 'ready' })
          }),
        },
        ...auth.routes,
        ...portfolioRoutes,
        ...mediaRoutes,
      },
      fetch: () => new Response('Not Found', { status: 404 }),
      development: !environment.production,
    },
    async close() {
      await database.close()
    },
  }
}
