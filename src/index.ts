import index from './client/index.html'
import { createServerOptions } from './server/app'

const server = Bun.serve(createServerOptions(index))

console.log(`Server running at ${server.url}`)
