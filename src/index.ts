import index from './client/index.html'
import { createServerApplication } from './server/app'

const application = createServerApplication(index)
const server = Bun.serve(application.options)

console.log(`Server running at ${server.url}`)

const shutdown = async () => {
  server.stop()
  await application.close()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
