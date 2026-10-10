import type { AssetReference, PortfolioDraftInput } from '../src/shared/types/portfolio'

type LegacySummary = { name: string; pronouns: string; position: string; about: string }
type LegacyExperience = {
  link: string
  place: string
  position: string
  startDate: string
  endDate: string
  description: string
}
type LegacyProject = {
  title: string
  date?: string
  description: string
  stack: string[]
  browserLink?: string
  githubLink?: string
  mobileLink?: string
  dekstopLink?: string
  companyName?: string
  projectType?: string
  projectRole?: string
}
type LegacyContact = { title: string; link: string }

const readFixture = async <Value>(path: string): Promise<Value> =>
  Bun.file(new URL(`../public/data/${path}`, import.meta.url)).json()

const monthNumbers: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
}
const parsePeriod = (
  value: string,
): { year: number | null; month: number | null; current: boolean } => {
  if (value === 'Present') return { year: null, month: null, current: true }
  const [month, year] = value.split(' ')
  return { year: Number(year), month: monthNumbers[month] ?? null, current: false }
}

const platformKey = (title: string): string =>
  title.toLowerCase() === 'youtube' ? 'youtube' : title.toLowerCase()

export type DemoAssets = {
  avatar?: AssetReference
  resume?: AssetReference
  workLogo?: AssetReference
  educationLogo?: AssetReference
  projectImages?: AssetReference[]
  platformIcons?: Record<string, AssetReference>
}

export const loadDemoPortfolio = async (assets: DemoAssets = {}): Promise<PortfolioDraftInput> => {
  const [summary, work, education, stack, projects, contacts] = await Promise.all([
    readFixture<LegacySummary>('summary.json'),
    readFixture<LegacyExperience[]>('work-exp.json'),
    readFixture<LegacyExperience[]>('education-exp.json'),
    readFixture<string[]>('stack.json'),
    readFixture<LegacyProject[]>('project.json'),
    readFixture<LegacyContact[]>('contact.json'),
  ])
  const platformNames = new Map<string, string>([
    ['github', 'GitHub'],
    ['youtube', 'YouTube'],
    ['linkedin', 'LinkedIn'],
    ['x', 'X'],
    ['website', 'Website'],
    ['mobile', 'Mobile'],
    ['desktop', 'Desktop'],
    ['email', 'Email'],
    ['phone', 'Phone'],
  ])
  const experiences = [
    ...work.map((item) => ({ ...item, kind: 'work' as const })),
    ...education.map((item) => ({ ...item, kind: 'education' as const })),
  ]

  return {
    expectedVersion: 2,
    profile: {
      name: summary.name,
      pronouns: summary.pronouns,
      headline: summary.position,
      about: summary.about,
      avatar: assets.avatar ?? null,
      resume: assets.resume ?? null,
    },
    experiences: experiences.map((item, sortOrder) => {
      const start = parsePeriod(item.startDate)
      const end = parsePeriod(item.endDate)
      return {
        id: crypto.randomUUID(),
        kind: item.kind,
        organization: item.place,
        roleOrProgram: item.position,
        websiteUrl: item.link,
        logo:
          (item.kind === 'work' && sortOrder === 0 ? assets.workLogo : undefined) ??
          (item.kind === 'education' && sortOrder === work.length
            ? assets.educationLogo
            : undefined) ??
          null,
        startYear: start.year ?? new Date().getFullYear(),
        startMonth: start.month,
        endYear: end.year,
        endMonth: end.month,
        isCurrent: end.current,
        description: item.description,
        sortOrder,
      }
    }),
    technologies: [
      ...new Set([
        ...stack.map((name) => (name === 'TailwindCSS' ? 'Tailwind CSS' : name)),
        ...projects.flatMap((project) =>
          project.stack.map((name) => (name === 'TailwindCSS' ? 'Tailwind CSS' : name)),
        ),
      ]),
    ],
    platforms: [...platformNames].map(([key, name], sortOrder) => ({
      id: crypto.randomUUID(),
      key,
      name,
      defaultIcon: assets.platformIcons?.[key] ?? null,
      sortOrder,
      isActive: true,
    })),
    contacts: contacts.map((contact, sortOrder) => ({
      id: crypto.randomUUID(),
      platformKey: platformKey(contact.title),
      label: platformNames.get(platformKey(contact.title)) ?? contact.title,
      url: contact.link,
      icon: null,
      sortOrder,
      isVisible: true,
    })),
    projects: projects.map((project, sortOrder) => {
      const links = [
        project.browserLink
          ? { platformKey: 'website', label: 'Website', url: project.browserLink, sortOrder: 0 }
          : null,
        project.githubLink
          ? { platformKey: 'github', label: 'GitHub', url: project.githubLink, sortOrder: 1 }
          : null,
        project.mobileLink
          ? { platformKey: 'mobile', label: 'Mobile', url: project.mobileLink, sortOrder: 2 }
          : null,
        project.dekstopLink
          ? { platformKey: 'desktop', label: 'Desktop', url: project.dekstopLink, sortOrder: 3 }
          : null,
      ].filter((link): link is NonNullable<typeof link> => link !== null)
      return {
        id: crypto.randomUUID(),
        title: project.title,
        description: project.description,
        projectDate: project.date ?? null,
        image: assets.projectImages?.[sortOrder] ?? null,
        clientName: project.companyName ?? '',
        projectType: project.projectType ?? '',
        projectRole: project.projectRole ?? '',
        sortOrder,
        technologies: project.stack.map((name) => (name === 'TailwindCSS' ? 'Tailwind CSS' : name)),
        links,
      }
    }),
  }
}
