import type {
  AssetReference,
  PortfolioAggregate,
  PortfolioDraftInput,
} from '../../../shared/types/portfolio'
import { apiRequest } from '../../shared/lib/api-client'
import { invalidatePortfolio } from '../portfolio/api'

const jsonHeaders = { 'Content-Type': 'application/json' }

export const getSession = () =>
  apiRequest<{ authenticated: true; user: { email: string } }>('/api/auth/session')
export const login = (email: string, password: string) =>
  apiRequest<{ authenticated: true }>('/api/auth/login', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  })
export const logout = () =>
  apiRequest<{ authenticated: false }>('/api/auth/logout', { method: 'POST', headers: jsonHeaders })
export const getDraft = () => apiRequest<PortfolioAggregate>('/api/dashboard/portfolio')
export const saveDraft = (draft: PortfolioDraftInput) =>
  apiRequest<PortfolioAggregate>('/api/dashboard/portfolio', {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(draft),
  })
export const publish = async () => {
  const result = await apiRequest<{ publishedVersion: number; nextDraftVersion: number }>(
    '/api/dashboard/publish',
    {
      method: 'POST',
      headers: jsonHeaders,
    },
  )
  invalidatePortfolio()
  return result
}
export const uploadAsset = async (file: File, category: string) => {
  const body = new FormData()
  body.set('file', file)
  body.set('category', category)
  return apiRequest<{ id: string; url: string; filename: string; contentType: string }>(
    '/api/dashboard/assets',
    { method: 'POST', body },
  )
}
export const getAssets = () => apiRequest<AssetReference[]>('/api/dashboard/assets')
