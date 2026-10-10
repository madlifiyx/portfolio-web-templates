import { createHmac, randomBytes } from 'node:crypto'
import type { SQL } from 'bun'
import type { Environment } from '../../shared/config/environment'
import { HttpError } from '../../shared/http'
import {
  createSession,
  deleteSession,
  findAdminByEmail,
  findSession,
  type SessionUser,
} from './repository'

const SESSION_COOKIE = 'portfolio_session'

export type AuthService = {
  login(email: string, password: string): Promise<{ cookie: string }>
  logout(token: string | null): Promise<string>
  authenticate(request: Request): Promise<SessionUser | null>
}

const tokenHash = (token: string, secret: string): string =>
  createHmac('sha256', secret).update(token).digest('hex')

const readCookie = (request: Request): string | null => {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  for (const cookie of cookieHeader.split(';')) {
    const [name, ...parts] = cookie.trim().split('=')
    if (name === SESSION_COOKIE) return decodeURIComponent(parts.join('='))
  }
  return null
}

const sessionCookie = (token: string, environment: Environment, maxAge: number): string => {
  const secure = environment.production ? '; Secure' : ''
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export const createAuthService = (database: SQL, environment: Environment): AuthService => ({
  async login(email, password) {
    const admin = await findAdminByEmail(database, email)
    const passwordMatches = admin ? await Bun.password.verify(password, admin.passwordHash) : false
    if (!admin || !passwordMatches) {
      await Bun.sleep(250)
      throw new HttpError(401, 'invalid_credentials', 'Invalid email or password')
    }

    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + environment.sessionTtlSeconds * 1000)
    await createSession(database, admin.id, tokenHash(token, environment.sessionSecret), expiresAt)
    return { cookie: sessionCookie(token, environment, environment.sessionTtlSeconds) }
  },

  async logout(token) {
    if (token) await deleteSession(database, tokenHash(token, environment.sessionSecret))
    return sessionCookie('', environment, 0)
  },

  async authenticate(request) {
    const token = readCookie(request)
    if (!token) return null
    return findSession(database, tokenHash(token, environment.sessionSecret))
  },
})

export const readSessionToken = readCookie
