import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { SQL } from 'bun'

const MIGRATION_LOCK_ID = 2_024_012

type AppliedMigration = {
  version: string
  checksum: string
}

const checksum = (content: string): string =>
  new Bun.CryptoHasher('sha256').update(content).digest('hex')

export const migrate = async (database: SQL, directory: string): Promise<string[]> => {
  await database`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `

  return database.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(${MIGRATION_LOCK_ID})`
    const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort()
    const appliedRows = await transaction<AppliedMigration[]>`
      SELECT version, checksum FROM schema_migrations ORDER BY version
    `
    const applied = new Map(appliedRows.map((row) => [row.version, row.checksum]))
    const migrated: string[] = []

    for (const file of files) {
      const content = await Bun.file(join(directory, file)).text()
      const digest = checksum(content)
      const previousChecksum = applied.get(file)

      if (previousChecksum && previousChecksum !== digest) {
        throw new Error(`Applied migration changed: ${file}`)
      }
      if (previousChecksum) continue

      await transaction.unsafe(content)
      await transaction`
        INSERT INTO schema_migrations (version, checksum) VALUES (${file}, ${digest})
      `
      migrated.push(file)
    }

    return migrated
  })
}

export const migrationStatus = async (
  database: SQL,
  directory: string,
): Promise<Array<{ version: string; applied: boolean }>> => {
  await database`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `
  const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort()
  const rows = await database<Array<{ version: string }>>`SELECT version FROM schema_migrations`
  const applied = new Set(rows.map((row) => row.version))
  return files.map((version) => ({ version, applied: applied.has(version) }))
}
