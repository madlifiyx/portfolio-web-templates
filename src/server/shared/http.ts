export type ApiError = {
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}

export const json = (value: unknown, status = 200, headers?: HeadersInit): Response =>
  Response.json(value, { status, headers })

export const apiError = (
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string>,
): Response => json({ error: { code, message, ...(fields ? { fields } : {}) } }, status)

export const readJson = async (request: Request): Promise<unknown> => {
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    throw new HttpError(415, 'unsupported_media_type', 'Content-Type must be application/json')
  }
  try {
    return await request.json()
  } catch {
    throw new HttpError(400, 'invalid_json', 'Request body must contain valid JSON')
  }
}

export const assertOrigin = (request: Request, appOrigin: string): void => {
  if (request.headers.get('origin') !== appOrigin) {
    throw new HttpError(403, 'invalid_origin', 'Request origin is not allowed')
  }
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message)
  }
}

export const safeHandler = <RequestType extends Request>(
  handler: (request: RequestType) => Promise<Response>,
): ((request: RequestType) => Promise<Response>) => {
  return async (request) => {
    try {
      return await handler(request)
    } catch (error) {
      if (error instanceof HttpError) {
        return apiError(error.code, error.message, error.status, error.fields)
      }
      console.error(
        'Unhandled request error',
        error instanceof Error ? error.message : 'Unknown error',
      )
      return apiError('internal_error', 'Internal server error', 500)
    }
  }
}
