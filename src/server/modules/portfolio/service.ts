import type { SQL } from 'bun'

type RevisionRow = { id: string; version: number }

export const publishDraft = async (
  database: SQL,
): Promise<{ publishedVersion: number; nextDraftVersion: number }> => {
  return database.begin(async (transaction) => {
    const [draft] = await transaction<RevisionRow[]>`
      SELECT id, version FROM portfolio_revisions WHERE status = 'draft' FOR UPDATE
    `
    const [published] = await transaction<RevisionRow[]>`
      SELECT id, version FROM portfolio_revisions WHERE status = 'published' FOR UPDATE
    `
    if (!draft || !published) throw new Error('Draft or published revision is missing')

    const [{ count }] = await transaction<Array<{ count: number }>>`
      SELECT count(*)::int AS count FROM profiles WHERE revision_id = ${draft.id}
    `
    if (count !== 1) throw new Error('Draft profile is incomplete')

    await transaction`UPDATE portfolio_revisions SET status = 'archived', updated_at = now() WHERE id = ${published.id}`
    await transaction`
      UPDATE portfolio_revisions SET status = 'published', published_at = now(), updated_at = now()
      WHERE id = ${draft.id}
    `
    const nextVersion = draft.version + 1
    const [nextDraft] = await transaction<RevisionRow[]>`
      INSERT INTO portfolio_revisions (status, version) VALUES ('draft', ${nextVersion}) RETURNING id, version
    `

    const [sourceProfile] = await transaction<Array<{ id: string }>>`
      SELECT id FROM profiles WHERE revision_id = ${draft.id}
    `
    const [targetProfile] = await transaction<Array<{ id: string }>>`
      INSERT INTO profiles (revision_id, name, pronouns, headline, about, avatar_asset_id, resume_asset_id)
      SELECT ${nextDraft.id}, name, pronouns, headline, about, avatar_asset_id, resume_asset_id
      FROM profiles WHERE id = ${sourceProfile.id} RETURNING id
    `
    await transaction`
      INSERT INTO experiences (revision_id, kind, organization, role_or_program, website_url, logo_asset_id,
        start_year, start_month, end_year, end_month, is_current, description, sort_order)
      SELECT ${nextDraft.id}, kind, organization, role_or_program, website_url, logo_asset_id,
        start_year, start_month, end_year, end_month, is_current, description, sort_order
      FROM experiences WHERE revision_id = ${draft.id}
    `

    const technologyRows = await transaction<
      Array<{ id: string; name: string; normalized_name: string }>
    >`
      SELECT id, name, normalized_name FROM technologies WHERE revision_id = ${draft.id}
    `
    const technologyIds = new Map<string, string>()
    for (const technology of technologyRows) {
      const [clone] = await transaction<Array<{ id: string }>>`
        INSERT INTO technologies (revision_id, name, normalized_name)
        VALUES (${nextDraft.id}, ${technology.name}, ${technology.normalized_name}) RETURNING id
      `
      technologyIds.set(technology.id, clone.id)
    }
    const profileTechnologies = await transaction<
      Array<{ technology_id: string; sort_order: number }>
    >`
      SELECT technology_id, sort_order FROM profile_technologies WHERE profile_id = ${sourceProfile.id}
    `
    for (const relation of profileTechnologies) {
      const technologyId = technologyIds.get(relation.technology_id)
      if (!technologyId) throw new Error('Technology clone is missing')
      await transaction`
        INSERT INTO profile_technologies (profile_id, technology_id, sort_order)
        VALUES (${targetProfile.id}, ${technologyId}, ${relation.sort_order})
      `
    }

    const platformRows = await transaction<
      Array<{
        id: string
        key: string
        name: string
        default_icon_asset_id: string | null
        sort_order: number
        is_active: boolean
      }>
    >`SELECT id, key, name, default_icon_asset_id, sort_order, is_active FROM platforms WHERE revision_id = ${draft.id}`
    const platformIds = new Map<string, string>()
    for (const platform of platformRows) {
      const [clone] = await transaction<Array<{ id: string }>>`
        INSERT INTO platforms (revision_id, key, name, default_icon_asset_id, sort_order, is_active)
        VALUES (${nextDraft.id}, ${platform.key}, ${platform.name}, ${platform.default_icon_asset_id},
          ${platform.sort_order}, ${platform.is_active}) RETURNING id
      `
      platformIds.set(platform.id, clone.id)
    }
    const contactRows = await transaction<
      Array<{
        platform_id: string | null
        label_override: string | null
        url: string
        icon_asset_id: string | null
        sort_order: number
        is_visible: boolean
      }>
    >`SELECT platform_id, label_override, url, icon_asset_id, sort_order, is_visible FROM contacts WHERE revision_id = ${draft.id}`
    for (const contact of contactRows) {
      await transaction`
        INSERT INTO contacts (revision_id, platform_id, label_override, url, icon_asset_id, sort_order, is_visible)
        VALUES (${nextDraft.id}, ${contact.platform_id ? platformIds.get(contact.platform_id) : null},
          ${contact.label_override}, ${contact.url}, ${contact.icon_asset_id}, ${contact.sort_order}, ${contact.is_visible})
      `
    }

    const projects = await transaction<
      Array<{
        id: string
        title: string
        description: string
        project_date: string | null
        image_asset_id: string | null
        client_name: string | null
        project_type: string | null
        project_role: string | null
        sort_order: number
      }>
    >`SELECT id, title, description, project_date::text, image_asset_id, client_name, project_type, project_role, sort_order
      FROM projects WHERE revision_id = ${draft.id}`
    for (const project of projects) {
      const [clone] = await transaction<Array<{ id: string }>>`
        INSERT INTO projects (revision_id, title, description, project_date, image_asset_id, client_name,
          project_type, project_role, sort_order)
        VALUES (${nextDraft.id}, ${project.title}, ${project.description}, ${project.project_date},
          ${project.image_asset_id}, ${project.client_name}, ${project.project_type}, ${project.project_role},
          ${project.sort_order}) RETURNING id
      `
      const projectTechnologies = await transaction<
        Array<{ technology_id: string; sort_order: number }>
      >`
        SELECT technology_id, sort_order FROM project_technologies WHERE project_id = ${project.id}
      `
      for (const relation of projectTechnologies) {
        const technologyId = technologyIds.get(relation.technology_id)
        if (!technologyId) throw new Error('Project technology clone is missing')
        await transaction`
          INSERT INTO project_technologies (project_id, technology_id, sort_order)
          VALUES (${clone.id}, ${technologyId}, ${relation.sort_order})
        `
      }
      const links = await transaction<
        Array<{ platform_id: string | null; label: string | null; url: string; sort_order: number }>
      >`SELECT platform_id, label, url, sort_order FROM project_links WHERE project_id = ${project.id}`
      for (const link of links) {
        await transaction`
          INSERT INTO project_links (project_id, platform_id, label, url, sort_order)
          VALUES (${clone.id}, ${link.platform_id ? platformIds.get(link.platform_id) : null},
            ${link.label}, ${link.url}, ${link.sort_order})
        `
      }
    }

    return { publishedVersion: draft.version, nextDraftVersion: nextDraft.version }
  })
}
