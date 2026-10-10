import type { PortfolioAggregate } from '../../../shared/types/portfolio'

let portfolioPromise: Promise<PortfolioAggregate | null> | null = null

const isPortfolioAggregate = (value: unknown): value is PortfolioAggregate => {
  if (typeof value !== 'object' || value === null) return false
  return (
    'version' in value &&
    typeof value.version === 'number' &&
    'profile' in value &&
    typeof value.profile === 'object' &&
    value.profile !== null &&
    'projects' in value &&
    Array.isArray(value.projects) &&
    'experiences' in value &&
    Array.isArray(value.experiences) &&
    'technologies' in value &&
    Array.isArray(value.technologies) &&
    'platforms' in value &&
    Array.isArray(value.platforms) &&
    'contacts' in value &&
    Array.isArray(value.contacts)
  )
}

export const getPortfolio = (): Promise<PortfolioAggregate | null> => {
  portfolioPromise ??= fetch('/api/portfolio')
    .then(async (response) => {
      if (!response.ok) return null
      const value: unknown = await response.json()
      return isPortfolioAggregate(value) ? value : null
    })
    .catch(() => {
      portfolioPromise = null
      return null
    })
  return portfolioPromise
}

export const invalidatePortfolio = (): void => {
  portfolioPromise = null
}
