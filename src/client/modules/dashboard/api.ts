import type {
  AssetReference,
  ContactDraftInput,
  DraftReorderInput,
  ExperienceDraftInput,
  PortfolioAggregate,
  PortfolioDraftInput,
  ProfileDraftInput,
  ProjectDraftInput,
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
const saveEntity = (path: string, method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', body: unknown) =>
  apiRequest<PortfolioAggregate>(path, {
    method,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  })
export const saveProfile = (id: string, profile: ProfileDraftInput) =>
  saveEntity(`/api/dashboard/profile/${id}`, 'PATCH', profile)
export const createExperience = (experience: ExperienceDraftInput) =>
  saveEntity('/api/dashboard/experiences', 'POST', experience)
export const saveExperience = (id: string, experience: ExperienceDraftInput) =>
  saveEntity(`/api/dashboard/experiences/${id}`, 'PATCH', experience)
export const deleteExperience = (id: string, expectedVersion: number) =>
  saveEntity(`/api/dashboard/experiences/${id}`, 'DELETE', { expectedVersion })
export const reorderExperiences = (input: DraftReorderInput) =>
  saveEntity('/api/dashboard/experiences/reorder', 'PUT', input)
export const createProject = (project: ProjectDraftInput) =>
  saveEntity('/api/dashboard/projects', 'POST', project)
export const saveProject = (id: string, project: ProjectDraftInput) =>
  saveEntity(`/api/dashboard/projects/${id}`, 'PATCH', project)
export const deleteProject = (id: string, expectedVersion: number) =>
  saveEntity(`/api/dashboard/projects/${id}`, 'DELETE', { expectedVersion })
export const reorderProjects = (input: DraftReorderInput) =>
  saveEntity('/api/dashboard/projects/reorder', 'PUT', input)
export const createContact = (contact: ContactDraftInput) =>
  saveEntity('/api/dashboard/contacts', 'POST', contact)
export const saveContact = (id: string, contact: ContactDraftInput) =>
  saveEntity(`/api/dashboard/contacts/${id}`, 'PATCH', contact)
export const deleteContact = (id: string, expectedVersion: number) =>
  saveEntity(`/api/dashboard/contacts/${id}`, 'DELETE', { expectedVersion })
export const reorderContacts = (input: DraftReorderInput) =>
  saveEntity('/api/dashboard/contacts/reorder', 'PUT', input)
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
export const deleteAsset = (id: string) =>
  apiRequest<null>(`/api/dashboard/assets/${id}`, { method: 'DELETE', headers: jsonHeaders })
