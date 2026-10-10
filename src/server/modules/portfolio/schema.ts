import type {
  AssetReference,
  ContactDraftInput,
  DraftReorderInput,
  ExperienceDraftInput,
  PortfolioDraftInput,
  ProfileDraftInput,
  ProjectDraftInput,
} from '../../../shared/types/portfolio'
import { HttpError } from '../../shared/http'

const stringValue = (object: Record<string, unknown>, key: string, maximum = 5000): string => {
  const value = object[key]
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maximum) {
    throw new HttpError(422, 'validation_error', `${key} is invalid`, {
      [key]: `Required, maximum ${maximum} characters`,
    })
  }
  return value.trim()
}

const optionalString = (object: Record<string, unknown>, key: string, maximum = 5000): string => {
  const value = object[key]
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'string' || value.length > maximum)
    throw new HttpError(422, 'validation_error', `${key} is invalid`)
  return value.trim()
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const recordValue = (value: unknown, name: string): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new HttpError(422, 'validation_error', `${name} must be an object`)
  }
  return value
}

const safeUrl = (value: string): string => {
  if (!value) return ''
  try {
    const url = new URL(value)
    if (!['https:', 'mailto:', 'tel:'].includes(url.protocol)) throw new Error()
    return value
  } catch {
    throw new HttpError(422, 'validation_error', 'URL must use https, mailto, or tel')
  }
}

const assetReference = (value: unknown): AssetReference | null => {
  if (value === null || value === undefined) return null
  const asset = recordValue(value, 'asset')
  const id = uuidValue(asset.id, 'Asset ID')
  return {
    id,
    url: `/media/${id}`,
    filename: stringValue(asset, 'filename', 255),
    contentType: stringValue(asset, 'contentType', 100),
  }
}

const expectedVersionValue = (object: Record<string, unknown>): number => {
  const expectedVersion = Number(object.expectedVersion)
  if (!Number.isInteger(expectedVersion) || expectedVersion <= 0) {
    throw new HttpError(422, 'validation_error', 'Draft version is invalid')
  }
  return expectedVersion
}

const uuidValue = (value: unknown, name: string): string => {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new HttpError(422, 'validation_error', `${name} is invalid`)
  }
  return value
}

const profileValue = (profile: Record<string, unknown>) => ({
  name: stringValue(profile, 'name', 200),
  pronouns: optionalString(profile, 'pronouns', 50),
  headline: stringValue(profile, 'headline', 200),
  about: stringValue(profile, 'about'),
  avatar: assetReference(profile.avatar),
  resume: assetReference(profile.resume),
})

const experienceValue = (entry: Record<string, unknown>) => {
  if (entry.kind !== 'work' && entry.kind !== 'education') {
    throw new HttpError(422, 'validation_error', 'Experience kind is invalid')
  }
  const kind: ExperienceDraftInput['kind'] = entry.kind
  const startYear = Number(entry.startYear)
  if (typeof entry.isCurrent !== 'boolean') {
    throw new HttpError(422, 'validation_error', 'Experience current status is invalid')
  }
  const isCurrent = entry.isCurrent
  if (!Number.isInteger(startYear) || startYear < 1900 || startYear > 2200) {
    throw new HttpError(422, 'validation_error', 'Experience start year is invalid')
  }
  const startMonth = entry.startMonth === null ? null : Number(entry.startMonth) || null
  const endYear = isCurrent || entry.endYear === null ? null : Number(entry.endYear) || null
  const endMonth = isCurrent || entry.endMonth === null ? null : Number(entry.endMonth) || null
  if (
    (startMonth !== null && (!Number.isInteger(startMonth) || startMonth < 1 || startMonth > 12)) ||
    (endMonth !== null && (!Number.isInteger(endMonth) || endMonth < 1 || endMonth > 12)) ||
    (endYear !== null && (!Number.isInteger(endYear) || endYear < startYear)) ||
    (endYear === startYear && endMonth !== null && startMonth !== null && endMonth < startMonth)
  ) {
    throw new HttpError(422, 'validation_error', 'Experience period is invalid')
  }
  return {
    kind,
    organization: stringValue(entry, 'organization', 200),
    roleOrProgram: stringValue(entry, 'roleOrProgram', 200),
    websiteUrl: safeUrl(optionalString(entry, 'websiteUrl', 2000)),
    logo: assetReference(entry.logo),
    startYear,
    startMonth,
    endYear,
    endMonth,
    isCurrent,
    description: optionalString(entry, 'description'),
  }
}

const projectValue = (entry: Record<string, unknown>) => {
  const technologies = Array.isArray(entry.technologies)
    ? entry.technologies.map((technology) => {
        if (typeof technology !== 'string' || !technology.trim()) {
          throw new HttpError(422, 'validation_error', 'Project technology is invalid')
        }
        return technology.trim()
      })
    : []
  const normalizedTechnologies = technologies.map((technology) =>
    technology.toLowerCase().replace(/\s+/g, ' '),
  )
  if (new Set(normalizedTechnologies).size !== normalizedTechnologies.length) {
    throw new HttpError(422, 'validation_error', 'Project technologies must be unique')
  }
  const links = Array.isArray(entry.links)
    ? entry.links.map((item, sortOrder) => {
        const link = recordValue(item, 'project link')
        return {
          platformKey: stringValue(link, 'platformKey', 50),
          label: optionalString(link, 'label', 100),
          url: safeUrl(stringValue(link, 'url', 2000)),
          sortOrder,
        }
      })
    : []
  const projectDate = optionalString(entry, 'projectDate', 10) || null
  if (projectDate && !/^\d{4}-\d{2}-\d{2}$/.test(projectDate)) {
    throw new HttpError(422, 'validation_error', 'Project date must use YYYY-MM-DD')
  }
  if (projectDate) {
    const [year, month, day] = projectDate.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new HttpError(422, 'validation_error', 'Project date is invalid')
    }
  }
  return {
    title: stringValue(entry, 'title', 200),
    description: stringValue(entry, 'description'),
    projectDate,
    image: assetReference(entry.image),
    clientName: optionalString(entry, 'clientName', 200),
    projectType: optionalString(entry, 'projectType', 100),
    projectRole: optionalString(entry, 'projectRole', 100),
    technologies,
    links,
  }
}

const contactValue = (entry: Record<string, unknown>) => {
  if (typeof entry.isVisible !== 'boolean') {
    throw new HttpError(422, 'validation_error', 'Contact visibility is invalid')
  }
  return {
    platformKey: stringValue(entry, 'platformKey', 50),
    labelOverride:
      entry.labelOverride === null || entry.labelOverride === ''
        ? null
        : optionalString(entry, 'labelOverride', 100) ||
          (entry.label === undefined ? null : stringValue(entry, 'label', 100)),
    url: safeUrl(stringValue(entry, 'url', 2000)),
    iconOverride: assetReference(
      entry.iconOverride === undefined ? entry.icon : entry.iconOverride,
    ),
    isVisible: entry.isVisible,
  }
}

export const parseProfileDraft = (value: unknown): ProfileDraftInput => {
  const input = recordValue(value, 'profile')
  return { expectedVersion: expectedVersionValue(input), ...profileValue(input) }
}

export const parseExperienceDraft = (value: unknown): ExperienceDraftInput => {
  const input = recordValue(value, 'experience')
  return { expectedVersion: expectedVersionValue(input), ...experienceValue(input) }
}

export const parseProjectDraft = (value: unknown): ProjectDraftInput => {
  const input = recordValue(value, 'project')
  return { expectedVersion: expectedVersionValue(input), ...projectValue(input) }
}

export const parseContactDraft = (value: unknown): ContactDraftInput => {
  const input = recordValue(value, 'contact')
  return { expectedVersion: expectedVersionValue(input), ...contactValue(input) }
}

export const parseDraftReorder = (value: unknown): DraftReorderInput => {
  const input = recordValue(value, 'reorder')
  if (!Array.isArray(input.ids) || input.ids.length > 1000) {
    throw new HttpError(422, 'validation_error', 'ids must be an array')
  }
  const ids = input.ids.map((id) => uuidValue(id, 'Entity ID'))
  if (new Set(ids).size !== ids.length) {
    throw new HttpError(422, 'validation_error', 'Entity IDs must be unique')
  }
  return { expectedVersion: expectedVersionValue(input), ids }
}

export const parseEntityId = (value: string): string => uuidValue(value, 'Entity ID')
export const parseExpectedVersion = (value: unknown): number =>
  expectedVersionValue(recordValue(value, 'request'))

export const parsePortfolioDraft = (value: unknown): PortfolioDraftInput => {
  const root = recordValue(value, 'portfolio')
  const expectedVersion = expectedVersionValue(root)
  const profile = recordValue(root.profile, 'profile')
  const technologies = Array.isArray(root.technologies)
    ? root.technologies.map((item) => {
        if (typeof item !== 'string' || !item.trim())
          throw new HttpError(422, 'validation_error', 'Technology is invalid')
        return item.trim()
      })
    : []
  const normalizedTechnologies = technologies.map((technology) =>
    technology.toLowerCase().replace(/\s+/g, ' '),
  )
  if (new Set(normalizedTechnologies).size !== normalizedTechnologies.length) {
    throw new HttpError(422, 'validation_error', 'Technology names must be unique')
  }
  const experiences = Array.isArray(root.experiences)
    ? root.experiences.map((item, sortOrder) => {
        const entry = recordValue(item, 'experience')
        return {
          id: entry.id ? uuidValue(entry.id, 'Experience ID') : '',
          ...experienceValue(entry),
          sortOrder,
        }
      })
    : []
  const platforms = Array.isArray(root.platforms)
    ? root.platforms.map((item, sortOrder) => {
        const entry = recordValue(item, 'platform')
        return {
          id: entry.id ? uuidValue(entry.id, 'Platform ID') : '',
          key: stringValue(entry, 'key', 50)
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-'),
          name: stringValue(entry, 'name', 100),
          defaultIcon: assetReference(entry.defaultIcon),
          sortOrder,
          isActive: entry.isActive !== false,
        }
      })
    : []
  const platformKeys = platforms.map((platform) => platform.key)
  if (new Set(platformKeys).size !== platformKeys.length) {
    throw new HttpError(422, 'validation_error', 'Platform keys must be unique')
  }
  const contacts = Array.isArray(root.contacts)
    ? root.contacts.map((item, sortOrder) => {
        const entry = recordValue(item, 'contact')
        const platformKey = stringValue(entry, 'platformKey', 50)
        const platform = platforms.find((candidate) => candidate.key === platformKey)
        const label = stringValue(entry, 'label', 100)
        const icon = assetReference(entry.icon)
        return {
          id: entry.id ? uuidValue(entry.id, 'Contact ID') : '',
          ...contactValue(entry),
          labelOverride: label === platform?.name ? null : label,
          label,
          iconOverride: icon?.id === platform?.defaultIcon?.id ? null : icon,
          icon,
          sortOrder,
        }
      })
    : []
  const projects = Array.isArray(root.projects)
    ? root.projects.map((item, sortOrder) => {
        const entry = recordValue(item, 'project')
        return {
          id: entry.id ? uuidValue(entry.id, 'Project ID') : '',
          ...projectValue(entry),
          sortOrder,
        }
      })
    : []

  for (const contact of contacts) {
    if (!platformKeys.includes(contact.platformKey)) {
      throw new HttpError(
        422,
        'validation_error',
        `Unknown contact platform: ${contact.platformKey}`,
      )
    }
  }
  for (const project of projects) {
    for (const link of project.links) {
      if (!platformKeys.includes(link.platformKey)) {
        throw new HttpError(
          422,
          'validation_error',
          `Unknown project link platform: ${link.platformKey}`,
        )
      }
    }
  }

  return {
    expectedVersion,
    profile: {
      id: profile.id ? uuidValue(profile.id, 'Profile ID') : '',
      ...profileValue(profile),
    },
    experiences,
    technologies,
    projects,
    platforms,
    contacts,
  }
}
