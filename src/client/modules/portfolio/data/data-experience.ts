import type { Experience } from '../../../../shared/types/portfolio'
import { getPortfolio } from '../api'

export interface ExperienceDataProps {
  link?: string
  logoImage?: string
  place?: string
  position?: string
  startDate?: string
  endDate?: string
  description?: string
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const period = (year: number | null, month: number | null): string => {
  if (!year) return ''
  return month ? `${monthNames[month - 1]} ${year}` : String(year)
}

const mapExperience = (experience: Experience): ExperienceDataProps => ({
  link: experience.websiteUrl,
  logoImage: experience.logo?.url,
  place: experience.organization,
  position: experience.roleOrProgram,
  startDate: period(experience.startYear, experience.startMonth),
  endDate: experience.isCurrent ? 'Present' : period(experience.endYear, experience.endMonth),
  description: experience.description,
})

export const getWorkExperience = async (): Promise<ExperienceDataProps[] | null> => {
  const portfolio = await getPortfolio()
  return portfolio?.experiences.filter((entry) => entry.kind === 'work').map(mapExperience) ?? null
}

export const getEducationExperience = async (): Promise<ExperienceDataProps[] | null> => {
  const portfolio = await getPortfolio()
  return (
    portfolio?.experiences.filter((entry) => entry.kind === 'education').map(mapExperience) ?? null
  )
}
