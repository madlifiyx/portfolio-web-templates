export type AssetReference = { id: string; url: string; filename: string; contentType: string }

export type Profile = {
  id?: string
  name: string
  pronouns: string
  headline: string
  about: string
  avatar: AssetReference | null
  resume: AssetReference | null
}

export type Experience = {
  id: string
  kind: 'work' | 'education'
  organization: string
  roleOrProgram: string
  websiteUrl: string
  logo: AssetReference | null
  startYear: number
  startMonth: number | null
  endYear: number | null
  endMonth: number | null
  isCurrent: boolean
  description: string
  sortOrder: number
}

export type Platform = {
  id: string
  key: string
  name: string
  defaultIcon: AssetReference | null
  sortOrder: number
  isActive: boolean
}

export type ProjectLink = {
  platformKey: string
  label: string
  url: string
  icon?: AssetReference | null
  sortOrder: number
}

export type Project = {
  id: string
  title: string
  description: string
  projectDate: string | null
  image: AssetReference | null
  clientName: string
  projectType: string
  projectRole: string
  sortOrder: number
  technologies: string[]
  links: ProjectLink[]
}

export type Contact = {
  id: string
  platformKey: string
  labelOverride?: string | null
  label: string
  url: string
  iconOverride?: AssetReference | null
  icon: AssetReference | null
  sortOrder: number
  isVisible: boolean
}

export type PortfolioAggregate = {
  version: number
  profile: Profile
  experiences: Experience[]
  technologies: string[]
  projects: Project[]
  platforms: Platform[]
  contacts: Contact[]
}

export type PortfolioDraftInput = Omit<PortfolioAggregate, 'version'> & { expectedVersion: number }

export type ProfileDraftInput = Omit<Profile, 'id'> & { expectedVersion: number }
export type ExperienceDraftInput = Omit<Experience, 'id' | 'sortOrder'> & {
  expectedVersion: number
}
export type ProjectDraftInput = Omit<Project, 'id' | 'sortOrder'> & { expectedVersion: number }
export type ContactDraftInput = Omit<
  Contact,
  'id' | 'sortOrder' | 'label' | 'icon' | 'labelOverride' | 'iconOverride'
> & {
  expectedVersion: number
  labelOverride: string | null
  iconOverride: AssetReference | null
}
export type DraftReorderInput = { expectedVersion: number; ids: string[] }
