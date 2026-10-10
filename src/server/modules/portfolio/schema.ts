import type { AssetReference, PortfolioDraftInput } from '../../../shared/types/portfolio'
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
  const id = stringValue(asset, 'id', 36)
  if (!/^[0-9a-f-]{36}$/i.test(id))
    throw new HttpError(422, 'validation_error', 'Asset ID is invalid')
  return {
    id,
    url: `/media/${id}`,
    filename: stringValue(asset, 'filename', 255),
    contentType: stringValue(asset, 'contentType', 100),
  }
}

export const parsePortfolioDraft = (value: unknown): PortfolioDraftInput => {
  const root = recordValue(value, 'portfolio')
  const expectedVersion = Number(root.expectedVersion)
  if (!Number.isInteger(expectedVersion) || expectedVersion <= 0) {
    throw new HttpError(422, 'validation_error', 'Draft version is invalid')
  }
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
        const kind: 'work' | 'education' = entry.kind === 'education' ? 'education' : 'work'
        const startYear = Number(entry.startYear)
        const isCurrent = entry.isCurrent === true
        if (!Number.isInteger(startYear) || startYear < 1900 || startYear > 2200) {
          throw new HttpError(422, 'validation_error', 'Experience start year is invalid')
        }
        const startMonth = entry.startMonth === null ? null : Number(entry.startMonth) || null
        const endYear = isCurrent || entry.endYear === null ? null : Number(entry.endYear) || null
        const endMonth =
          isCurrent || entry.endMonth === null ? null : Number(entry.endMonth) || null
        if (
          (startMonth !== null &&
            (!Number.isInteger(startMonth) || startMonth < 1 || startMonth > 12)) ||
          (endMonth !== null && (!Number.isInteger(endMonth) || endMonth < 1 || endMonth > 12)) ||
          (endYear !== null && (!Number.isInteger(endYear) || endYear < startYear))
        ) {
          throw new HttpError(422, 'validation_error', 'Experience period is invalid')
        }
        return {
          id: optionalString(entry, 'id'),
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
          sortOrder,
        }
      })
    : []
  const platforms = Array.isArray(root.platforms)
    ? root.platforms.map((item, sortOrder) => {
        const entry = recordValue(item, 'platform')
        return {
          id: optionalString(entry, 'id'),
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
        return {
          id: optionalString(entry, 'id'),
          platformKey: stringValue(entry, 'platformKey', 50),
          label: stringValue(entry, 'label', 100),
          url: safeUrl(stringValue(entry, 'url', 2000)),
          icon: assetReference(entry.icon),
          sortOrder,
          isVisible: entry.isVisible !== false,
        }
      })
    : []
  const projects = Array.isArray(root.projects)
    ? root.projects.map((item, sortOrder) => {
        const entry = recordValue(item, 'project')
        const projectTechnologies = Array.isArray(entry.technologies)
          ? entry.technologies.filter(
              (technology): technology is string =>
                typeof technology === 'string' && Boolean(technology.trim()),
            )
          : []
        const normalizedProjectTechnologies = projectTechnologies.map((technology) =>
          technology.toLowerCase().replace(/\s+/g, ' '),
        )
        if (new Set(normalizedProjectTechnologies).size !== normalizedProjectTechnologies.length) {
          throw new HttpError(422, 'validation_error', 'Project technologies must be unique')
        }
        const links = Array.isArray(entry.links)
          ? entry.links.map((item, linkOrder) => {
              const link = recordValue(item, 'project link')
              return {
                platformKey: stringValue(link, 'platformKey', 50),
                label: optionalString(link, 'label', 100),
                url: safeUrl(stringValue(link, 'url', 2000)),
                sortOrder: linkOrder,
              }
            })
          : []
        const projectDate = optionalString(entry, 'projectDate', 10) || null
        if (projectDate && !/^\d{4}-\d{2}-\d{2}$/.test(projectDate)) {
          throw new HttpError(422, 'validation_error', 'Project date must use YYYY-MM-DD')
        }
        return {
          id: optionalString(entry, 'id'),
          title: stringValue(entry, 'title', 200),
          description: stringValue(entry, 'description'),
          projectDate,
          image: assetReference(entry.image),
          clientName: optionalString(entry, 'clientName', 200),
          projectType: optionalString(entry, 'projectType', 100),
          projectRole: optionalString(entry, 'projectRole', 100),
          sortOrder,
          technologies: projectTechnologies,
          links,
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
      name: stringValue(profile, 'name', 200),
      pronouns: optionalString(profile, 'pronouns', 50),
      headline: stringValue(profile, 'headline', 200),
      about: stringValue(profile, 'about'),
      avatar: assetReference(profile.avatar),
      resume: assetReference(profile.resume),
    },
    experiences,
    technologies,
    projects,
    platforms,
    contacts,
  }
}
