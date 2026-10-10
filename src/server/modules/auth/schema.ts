import { HttpError } from '../../shared/http'

export type LoginInput = { email: string; password: string }

export const parseLoginInput = (value: unknown): LoginInput => {
  if (typeof value !== 'object' || value === null) {
    throw new HttpError(422, 'validation_error', 'Invalid login fields')
  }

  const email =
    'email' in value && typeof value.email === 'string' ? value.email.trim().toLowerCase() : ''
  const password = 'password' in value && typeof value.password === 'string' ? value.password : ''
  const fields: Record<string, string> = {}

  if (!/^\S+@\S+\.\S+$/.test(email)) fields.email = 'Enter a valid email address'
  if (password.length < 12 || password.length > 256)
    fields.password = 'Password must contain 12 to 256 characters'
  if (Object.keys(fields).length > 0) {
    throw new HttpError(422, 'validation_error', 'Invalid login fields', fields)
  }

  return { email, password }
}
