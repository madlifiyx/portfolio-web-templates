import index from '../index.html'
import { createServerOptions } from './server/app'

Bun.serve(createServerOptions(index))
