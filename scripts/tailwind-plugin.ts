import type { BunPlugin } from 'bun'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

const tailwindPlugin: BunPlugin = {
  name: 'tailwind-v3',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const source = await Bun.file(path).text()
      const result = await postcss([tailwindcss(), autoprefixer()]).process(
        source,
        { from: path },
      )

      return { contents: result.css, loader: 'css' }
    })
  },
}

export default tailwindPlugin
