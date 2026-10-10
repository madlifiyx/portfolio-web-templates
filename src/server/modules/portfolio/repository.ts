import type { SQL } from 'bun'
import type {
  Contact,
  Experience,
  Platform,
  PortfolioAggregate,
  PortfolioDraftInput,
  Project,
} from '../../../shared/types/portfolio'
import { HttpError } from '../../shared/http'

type RevisionRow = { id: string; version: number }
type ProfileRow = {
  name: string
  pronouns: string | null
  headline: string
  about: string
  avatarId: string | null
  avatarFilename: string | null
  avatarContentType: string | null
  resumeId: string | null
  resumeFilename: string | null
  resumeContentType: string | null
}

const readRevisionSnapshot = async (
  database: SQL,
  status: 'draft' | 'published',
): Promise<PortfolioAggregate | null> => {
  const [revision] = await database<
    RevisionRow[]
  >`SELECT id, version FROM portfolio_revisions WHERE status = ${status}`
  if (!revision) return null
  const [profile] = await database<ProfileRow[]>`
    SELECT profiles.name, profiles.pronouns, profiles.headline, profiles.about,
      avatar.id AS "avatarId", avatar.original_filename AS "avatarFilename", avatar.content_type AS "avatarContentType",
      resume.id AS "resumeId", resume.original_filename AS "resumeFilename", resume.content_type AS "resumeContentType"
    FROM profiles
    LEFT JOIN assets avatar ON avatar.id = profiles.avatar_asset_id
    LEFT JOIN assets resume ON resume.id = profiles.resume_asset_id
    WHERE profiles.revision_id = ${revision.id}
  `
  if (!profile) return null
  const experiences = await database<Experience[]>`
    SELECT experiences.id, experiences.kind, experiences.organization, experiences.role_or_program AS "roleOrProgram",
      COALESCE(experiences.website_url, '') AS "websiteUrl",
      CASE WHEN assets.id IS NULL THEN NULL ELSE json_build_object('id', assets.id, 'url', '/media/' || assets.id,
        'filename', assets.original_filename, 'contentType', assets.content_type) END AS logo,
      experiences.start_year AS "startYear", experiences.start_month AS "startMonth",
      experiences.end_year AS "endYear", experiences.end_month AS "endMonth",
      experiences.is_current AS "isCurrent", COALESCE(experiences.description, '') AS description,
      experiences.sort_order AS "sortOrder"
    FROM experiences LEFT JOIN assets ON assets.id = experiences.logo_asset_id
    WHERE experiences.revision_id = ${revision.id} ORDER BY experiences.kind, experiences.sort_order
  `
  const technologies = await database<Array<{ name: string }>>`
    SELECT technologies.name FROM profile_technologies
    JOIN profiles ON profiles.id = profile_technologies.profile_id
    JOIN technologies ON technologies.id = profile_technologies.technology_id
    WHERE profiles.revision_id = ${revision.id} ORDER BY profile_technologies.sort_order
  `
  const platforms = await database<Platform[]>`
    SELECT platforms.id, platforms.key, platforms.name,
      CASE WHEN assets.id IS NULL THEN NULL ELSE json_build_object('id', assets.id, 'url', '/media/' || assets.id,
        'filename', assets.original_filename, 'contentType', assets.content_type) END AS "defaultIcon",
      platforms.sort_order AS "sortOrder", platforms.is_active AS "isActive"
    FROM platforms LEFT JOIN assets ON assets.id = platforms.default_icon_asset_id
    WHERE platforms.revision_id = ${revision.id} ORDER BY platforms.sort_order
  `
  const contacts = await database<Contact[]>`
    SELECT contacts.id, platforms.key AS "platformKey", COALESCE(contacts.label_override, platforms.name) AS label,
      contacts.url, CASE WHEN COALESCE(contact_asset.id, platform_asset.id) IS NULL THEN NULL ELSE json_build_object(
        'id', COALESCE(contact_asset.id, platform_asset.id), 'url', '/media/' || COALESCE(contact_asset.id, platform_asset.id),
        'filename', COALESCE(contact_asset.original_filename, platform_asset.original_filename),
        'contentType', COALESCE(contact_asset.content_type, platform_asset.content_type)) END AS icon,
      contacts.sort_order AS "sortOrder", contacts.is_visible AS "isVisible"
    FROM contacts LEFT JOIN platforms ON platforms.id = contacts.platform_id
    LEFT JOIN assets contact_asset ON contact_asset.id = contacts.icon_asset_id
    LEFT JOIN assets platform_asset ON platform_asset.id = platforms.default_icon_asset_id
    WHERE contacts.revision_id = ${revision.id} ORDER BY contacts.sort_order
  `
  const projects = await database<Project[]>`
    SELECT projects.id, projects.title, projects.description, projects.project_date::text AS "projectDate",
      CASE WHEN assets.id IS NULL THEN NULL ELSE json_build_object('id', assets.id, 'url', '/media/' || assets.id,
        'filename', assets.original_filename, 'contentType', assets.content_type) END AS image,
      COALESCE(client_name, '') AS "clientName", COALESCE(project_type, '') AS "projectType",
      COALESCE(project_role, '') AS "projectRole", sort_order AS "sortOrder",
      ARRAY[]::text[] AS technologies, '[]'::json AS links
    FROM projects LEFT JOIN assets ON assets.id = projects.image_asset_id
    WHERE projects.revision_id = ${revision.id} ORDER BY projects.sort_order
  `
  for (const project of projects) {
    const techRows = await database<Array<{ name: string }>>`
      SELECT technologies.name FROM project_technologies
      JOIN technologies ON technologies.id = project_technologies.technology_id
      WHERE project_technologies.project_id = ${project.id} ORDER BY project_technologies.sort_order
    `
    const links = await database<
      Array<{ platformKey: string; label: string; url: string; sortOrder: number }>
    >`
      SELECT platforms.key AS "platformKey", COALESCE(project_links.label, platforms.name) AS label,
        project_links.url, project_links.sort_order AS "sortOrder"
      FROM project_links LEFT JOIN platforms ON platforms.id = project_links.platform_id
      WHERE project_links.project_id = ${project.id} ORDER BY project_links.sort_order
    `
    project.technologies = techRows.map((row) => row.name)
    project.links = links
  }
  return {
    version: revision.version,
    profile: {
      name: profile.name,
      pronouns: profile.pronouns ?? '',
      headline: profile.headline,
      about: profile.about,
      avatar: profile.avatarId
        ? {
            id: profile.avatarId,
            url: `/media/${profile.avatarId}`,
            filename: profile.avatarFilename ?? '',
            contentType: profile.avatarContentType ?? '',
          }
        : null,
      resume: profile.resumeId
        ? {
            id: profile.resumeId,
            url: `/media/${profile.resumeId}`,
            filename: profile.resumeFilename ?? '',
            contentType: profile.resumeContentType ?? '',
          }
        : null,
    },
    experiences,
    technologies: technologies.map((row) => row.name),
    projects,
    platforms,
    contacts,
  }
}

export const readPublished = (database: SQL): Promise<PortfolioAggregate | null> =>
  database.begin('isolation level repeatable read read only', (transaction) =>
    readRevisionSnapshot(transaction, 'published'),
  )
export const readDraft = (database: SQL): Promise<PortfolioAggregate | null> =>
  database.begin('isolation level repeatable read read only', (transaction) =>
    readRevisionSnapshot(transaction, 'draft'),
  )

const normalizedTechnology = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, ' ')

export const replaceDraft = async (database: SQL, input: PortfolioDraftInput): Promise<void> => {
  await database.begin(async (transaction) => {
    const [revision] = await transaction<
      RevisionRow[]
    >`SELECT id, version FROM portfolio_revisions WHERE status = 'draft' FOR UPDATE`
    if (!revision) throw new Error('Draft revision is missing')
    if (revision.version !== input.expectedVersion) {
      throw new HttpError(
        409,
        'stale_draft',
        'Draft changed in another session. Reload before saving.',
      )
    }
    const [profile] = await transaction<
      Array<{ id: string }>
    >`SELECT id FROM profiles WHERE revision_id = ${revision.id}`
    if (!profile) throw new HttpError(409, 'invalid_draft', 'Draft profile is missing')
    await transaction`
      UPDATE profiles SET name = ${input.profile.name}, pronouns = ${input.profile.pronouns},
        headline = ${input.profile.headline}, about = ${input.profile.about},
        avatar_asset_id = ${input.profile.avatar?.id ?? null}, resume_asset_id = ${input.profile.resume?.id ?? null},
        updated_at = now()
      WHERE id = ${profile.id}
    `
    await transaction`DELETE FROM experiences WHERE revision_id = ${revision.id}`
    await transaction`DELETE FROM contacts WHERE revision_id = ${revision.id}`
    await transaction`DELETE FROM projects WHERE revision_id = ${revision.id}`
    await transaction`DELETE FROM platforms WHERE revision_id = ${revision.id}`
    await transaction`DELETE FROM technologies WHERE revision_id = ${revision.id}`

    const technologyIds = new Map<string, string>()
    for (const [sortOrder, name] of input.technologies.entries()) {
      const [technology] = await transaction<Array<{ id: string }>>`
        INSERT INTO technologies (revision_id, name, normalized_name)
        VALUES (${revision.id}, ${name}, ${normalizedTechnology(name)}) RETURNING id
      `
      technologyIds.set(normalizedTechnology(name), technology.id)
      await transaction`
        INSERT INTO profile_technologies (profile_id, technology_id, sort_order)
        VALUES (${profile.id}, ${technology.id}, ${sortOrder})
      `
    }
    for (const experience of input.experiences) {
      await transaction`
        INSERT INTO experiences (revision_id, kind, organization, role_or_program, website_url, logo_asset_id, start_year,
          start_month, end_year, end_month, is_current, description, sort_order)
        VALUES (${revision.id}, ${experience.kind}, ${experience.organization}, ${experience.roleOrProgram},
          ${experience.websiteUrl || null}, ${experience.logo?.id ?? null}, ${experience.startYear}, ${experience.startMonth}, ${experience.endYear},
          ${experience.endMonth}, ${experience.isCurrent}, ${experience.description || null}, ${experience.sortOrder})
      `
    }
    const platformIds = new Map<string, string>()
    for (const platform of input.platforms) {
      const [row] = await transaction<Array<{ id: string }>>`
        INSERT INTO platforms (revision_id, key, name, default_icon_asset_id, sort_order, is_active)
        VALUES (${revision.id}, ${platform.key}, ${platform.name}, ${platform.defaultIcon?.id ?? null},
          ${platform.sortOrder}, ${platform.isActive}) RETURNING id
      `
      platformIds.set(platform.key, row.id)
    }
    for (const contact of input.contacts) {
      await transaction`
        INSERT INTO contacts (revision_id, platform_id, label_override, url, icon_asset_id, sort_order, is_visible)
        VALUES (${revision.id}, ${platformIds.get(contact.platformKey) ?? null}, ${contact.label}, ${contact.url},
          ${contact.icon?.id ?? null}, ${contact.sortOrder}, ${contact.isVisible})
      `
    }
    for (const project of input.projects) {
      const [projectRow] = await transaction<Array<{ id: string }>>`
        INSERT INTO projects (revision_id, title, description, project_date, image_asset_id, client_name, project_type,
          project_role, sort_order)
        VALUES (${revision.id}, ${project.title}, ${project.description}, ${project.projectDate}, ${project.image?.id ?? null}, ${project.clientName || null},
          ${project.projectType || null}, ${project.projectRole || null}, ${project.sortOrder}) RETURNING id
      `
      for (const [sortOrder, name] of project.technologies.entries()) {
        let technologyId = technologyIds.get(normalizedTechnology(name))
        if (!technologyId) {
          const [technology] = await transaction<Array<{ id: string }>>`
            INSERT INTO technologies (revision_id, name, normalized_name)
            VALUES (${revision.id}, ${name}, ${normalizedTechnology(name)}) RETURNING id
          `
          technologyId = technology.id
          technologyIds.set(normalizedTechnology(name), technologyId)
        }
        await transaction`
          INSERT INTO project_technologies (project_id, technology_id, sort_order)
          VALUES (${projectRow.id}, ${technologyId}, ${sortOrder})
        `
      }
      for (const link of project.links) {
        await transaction`
          INSERT INTO project_links (project_id, platform_id, label, url, sort_order)
          VALUES (${projectRow.id}, ${platformIds.get(link.platformKey) ?? null}, ${link.label || null}, ${link.url}, ${link.sortOrder})
        `
      }
    }
    await transaction`UPDATE portfolio_revisions SET updated_at = now() WHERE id = ${revision.id}`
  })
}
