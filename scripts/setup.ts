import { join } from 'node:path'
import { SQL } from 'bun'
import { createStorageClient, uploadTrustedSeedAsset } from '../src/server/modules/media/service'
import { replaceDraft } from '../src/server/modules/portfolio/repository'
import { publishDraft } from '../src/server/modules/portfolio/service'
import { parseEnvironment } from '../src/server/shared/config/environment'
import { migrate } from '../src/server/shared/database/migrations'
import { loadDemoPortfolio } from './demo-import'

const environment = parseEnvironment(process.env)
const database = new SQL(environment.databaseUrl)
const migrationsDirectory = join(import.meta.dir, '..', 'migrations')
const seededAssets: Array<{ id: string; objectKey: string }> = []

const promptRequired = (label: string): string => {
  const value = prompt(label)?.trim()
  if (!value) throw new Error(`${label} is required`)
  return value
}

const readHidden = async (label: string): Promise<string> => {
  if (!process.stdin.isTTY) throw new Error('Interactive terminal is required for password setup')
  process.stdout.write(label)
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding('utf8')

  return new Promise((resolve, reject) => {
    let value = ''
    const finish = () => {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.removeListener('data', onData)
      process.stdout.write('\n')
    }
    const onData = (chunk: string) => {
      if (chunk === '\u0003') {
        finish()
        reject(new Error('Setup cancelled'))
        return
      }
      if (chunk === '\r' || chunk === '\n') {
        finish()
        resolve(value)
        return
      }
      if (chunk === '\u007f') {
        value = value.slice(0, -1)
        return
      }
      value += chunk
    }
    process.stdin.on('data', onData)
  })
}

try {
  await migrate(database, migrationsDirectory)
  const [{ count }] = await database<
    Array<{ count: string }>
  >`SELECT count(*)::text AS count FROM admin_users`
  if (count !== '0') throw new Error('Administrator already exists')

  const email = (
    process.env.SETUP_ADMIN_EMAIL?.trim() || promptRequired('Admin email:')
  ).toLowerCase()
  const password = process.env.SETUP_ADMIN_PASSWORD || (await readHidden('Admin password: '))
  const confirmation = process.env.SETUP_ADMIN_PASSWORD || (await readHidden('Confirm password: '))
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Admin email is invalid')
  if (password.length < 12) throw new Error('Password must contain at least 12 characters')
  if (password !== confirmation) throw new Error('Password confirmation does not match')

  const passwordHash = await Bun.password.hash(password)
  await database.begin(async (transaction) => {
    await transaction`INSERT INTO admin_users (email, password_hash) VALUES (${email}, ${passwordHash})`
    const [published] = await transaction<Array<{ id: string }>>`
      INSERT INTO portfolio_revisions (status, version, published_at)
      VALUES ('published', 1, now()) RETURNING id
    `
    const [draft] = await transaction<Array<{ id: string }>>`
      INSERT INTO portfolio_revisions (status, version) VALUES ('draft', 2) RETURNING id
    `
    for (const revisionId of [published.id, draft.id]) {
      await transaction`
        INSERT INTO profiles (revision_id, name, headline, about)
        VALUES (${revisionId}, 'Your Name', 'Your Headline', 'Tell visitors about yourself.')
      `
      const platforms = [
        ['github', 'GitHub'],
        ['youtube', 'YouTube'],
        ['linkedin', 'LinkedIn'],
        ['x', 'X'],
        ['website', 'Website'],
        ['email', 'Email'],
        ['phone', 'Phone'],
        ['mobile', 'Mobile'],
        ['desktop', 'Desktop'],
        ['custom', 'Custom'],
      ] as const
      for (const [sortOrder, platform] of platforms.entries()) {
        await transaction`
          INSERT INTO platforms (revision_id, key, name, sort_order)
          VALUES (${revisionId}, ${platform[0]}, ${platform[1]}, ${sortOrder})
        `
      }
    }
  })
  try {
    if (process.argv.includes('--seed-demo')) {
      const storage = createStorageClient(environment)
      const upload = async (path: string, category: string, contentType: string) => {
        const file = Bun.file(new URL(`../public/${path}`, import.meta.url))
        const asset = await uploadTrustedSeedAsset(
          database,
          storage,
          environment,
          file,
          path.split('/').at(-1) ?? 'asset',
          contentType,
          category,
        )
        const [{ object_key }] = await database<Array<{ object_key: string }>>`
          SELECT object_key FROM assets WHERE id = ${asset.id}
        `
        seededAssets.push({ id: asset.id, objectKey: object_key })
        return asset
      }
      const platformIcons = Object.fromEntries(
        await Promise.all(
          ['github', 'youtube', 'linkedin', 'x'].map(async (key) => [
            key,
            await upload(`icon/${key}.svg`, 'platforms', 'image/svg+xml'),
          ]),
        ),
      )
      const demo = await loadDemoPortfolio({
        resume: await upload('pdf/resume.pdf', 'profile-resume', 'application/pdf'),
        workLogo: await upload('images/company/delameta-bilano.png', 'experiences', 'image/png'),
        educationLogo: await upload('images/education/neuversity.jpg', 'experiences', 'image/jpeg'),
        projectImages: [
          await upload('images/project/portfolio.png', 'projects', 'image/png'),
          await upload('images/project/airbnb.png', 'projects', 'image/png'),
        ],
        platformIcons,
      })
      try {
        const response = await fetch('https://github.com/madlifiyx.png')
        if (response.ok) {
          demo.profile.avatar = await uploadTrustedSeedAsset(
            database,
            storage,
            environment,
            await response.blob(),
            'avatar.png',
            response.headers.get('content-type') ?? 'image/png',
            'profile-avatar',
          )
          const [{ object_key }] = await database<Array<{ object_key: string }>>`
            SELECT object_key FROM assets WHERE id = ${demo.profile.avatar.id}
          `
          seededAssets.push({ id: demo.profile.avatar.id, objectKey: object_key })
        }
      } catch {
        console.warn('Remote avatar could not be imported')
      }
      await replaceDraft(database, demo)
      await publishDraft(database)
    }
  } catch (error) {
    if (seededAssets.length > 0) {
      const storage = createStorageClient(environment)
      for (const asset of seededAssets) {
        await storage.delete(asset.objectKey).catch(() => undefined)
      }
    }
    await database.begin(async (transaction) => {
      await transaction`DELETE FROM portfolio_revisions`
      await transaction`DELETE FROM assets`
      await transaction`DELETE FROM admin_users`
    })
    throw error
  }
  console.log('Administrator and initial portfolio revisions created')
} finally {
  await database.close()
}
