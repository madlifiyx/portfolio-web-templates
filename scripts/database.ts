import { join } from 'node:path'
import { SQL } from 'bun'
import { parseEnvironment } from '../src/server/shared/config/environment'
import { migrate, migrationStatus } from '../src/server/shared/database/migrations'

const environment = parseEnvironment(process.env)
const database = new SQL(environment.databaseUrl)
const migrationsDirectory = join(import.meta.dir, '..', 'migrations')
const command = process.argv[2]

try {
  if (command === 'migrate') {
    const migrated = await migrate(database, migrationsDirectory)
    console.log(
      migrated.length === 0 ? 'Database is up to date' : `Applied: ${migrated.join(', ')}`,
    )
  } else if (command === 'status') {
    const status = await migrationStatus(database, migrationsDirectory)
    for (const migration of status) {
      console.log(`${migration.applied ? '[x]' : '[ ]'} ${migration.version}`)
    }
  } else {
    throw new Error('Usage: bun scripts/database.ts <migrate|status>')
  }
} finally {
  await database.close()
}
