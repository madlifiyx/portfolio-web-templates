export type AssetReference = { id: string; url: string; filename: string; contentType: string }

export type Profile = {
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

export type ProjectLink = { platformKey: string; label: string; url: string; sortOrder: number }

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
  label: string
  url: string
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
