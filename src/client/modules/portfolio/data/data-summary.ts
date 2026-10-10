import { getPortfolio } from '../api'

export interface SummaryData {
  name?: string
  pronouns?: string
  position?: string
  avatar?: string
  resume?: string
  about?: string
}

export const getSummary = async (): Promise<SummaryData | null> => {
  const portfolio = await getPortfolio()
  if (!portfolio) return null
  return {
    name: portfolio.profile.name,
    pronouns: portfolio.profile.pronouns,
    position: portfolio.profile.headline,
    avatar: portfolio.profile.avatar?.url,
    resume: portfolio.profile.resume?.url,
    about: portfolio.profile.about,
  }
}
