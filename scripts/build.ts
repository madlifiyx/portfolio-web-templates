import { cp, rm } from 'node:fs/promises'
import tailwindPlugin from 'bun-plugin-tailwind'

await rm('dist', { recursive: true, force: true })

const result = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'bun',
  minify: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [tailwindPlugin],
})

if (!result.success) {
  for (const log of result.logs) {
    console.error(log)
  }

  process.exit(1)
}

await cp('public', 'dist/public', { recursive: true })
