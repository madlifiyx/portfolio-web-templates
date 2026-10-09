const PUBLIC_PATH_PREFIXES = ['/data/', '/icon/', '/images/', '/pdf/']
export const PUBLIC_CLIENT_ROUTES = ['/', '/contact', '/project'] as const

const servePublicFile = async (request: Request): Promise<Response> => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const pathname = new URL(request.url).pathname

  if (!PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return new Response('Not Found', { status: 404 })
  }

  const file = Bun.file(`public${pathname}`)

  if (!(await file.exists())) {
    return new Response('Not Found', { status: 404 })
  }

  return new Response(request.method === 'HEAD' ? null : file, {
    headers: { 'Content-Type': file.type },
  })
}

export const createServerOptions = (index: Bun.HTMLBundle): Bun.Serve.Options<undefined> => ({
  routes: {
    [PUBLIC_CLIENT_ROUTES[0]]: index,
    [PUBLIC_CLIENT_ROUTES[1]]: index,
    [PUBLIC_CLIENT_ROUTES[2]]: index,
  },
  fetch: servePublicFile,
  development: process.env.NODE_ENV !== 'production',
})
