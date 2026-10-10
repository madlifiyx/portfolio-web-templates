import type { SQL } from 'bun'

export type AdminUser = { id: string; email: string; passwordHash: string }
export type SessionUser = { id: string; email: string; expiresAt: Date }

type AdminRow = { id: string; email: string; password_hash: string }
type SessionRow = { id: string; email: string; expires_at: Date }

export const findAdminByEmail = async (database: SQL, email: string): Promise<AdminUser | null> => {
  const [row] = await database<AdminRow[]>`
    SELECT id, email, password_hash FROM admin_users WHERE email = ${email}
  `
  return row ? { id: row.id, email: row.email, passwordHash: row.password_hash } : null
}

export const createSession = async (
  database: SQL,
  adminUserId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> => {
  await database`
    INSERT INTO sessions (admin_user_id, token_hash, expires_at)
    VALUES (${adminUserId}, ${tokenHash}, ${expiresAt})
  `
}

export const findSession = async (
  database: SQL,
  tokenHash: string,
): Promise<SessionUser | null> => {
  const [row] = await database<SessionRow[]>`
    SELECT admin_users.id, admin_users.email, sessions.expires_at
    FROM sessions
    JOIN admin_users ON admin_users.id = sessions.admin_user_id
    WHERE sessions.token_hash = ${tokenHash} AND sessions.expires_at > now()
  `
  if (row) {
    await database`
      UPDATE sessions SET last_seen_at = now()
      WHERE token_hash = ${tokenHash} AND last_seen_at < now() - interval '5 minutes'
    `
  }
  return row ? { id: row.id, email: row.email, expiresAt: row.expires_at } : null
}

export const deleteSession = async (database: SQL, tokenHash: string): Promise<void> => {
  await database`DELETE FROM sessions WHERE token_hash = ${tokenHash}`
}
