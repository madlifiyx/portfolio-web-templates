export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message)
  }
}

export const apiRequest = async <Result>(path: string, init?: RequestInit): Promise<Result> => {
  const response = await fetch(path, { credentials: 'same-origin', ...init })
  const value: unknown = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'error' in value &&
      typeof value.error === 'object' &&
      value.error !== null
    ) {
      const error = value.error
      const message =
        'message' in error && typeof error.message === 'string' ? error.message : 'Request failed'
      const fields =
        'fields' in error && typeof error.fields === 'object' && error.fields !== null
          ? (error.fields as Record<string, string>)
          : {}
      throw new ApiClientError(message, fields)
    }
    throw new ApiClientError('Request failed')
  }
  return value as Result
}
