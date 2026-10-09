import { RouterProvider } from 'react-router'
import { portfolioRouter, ThemeProvider } from './modules/portfolio'

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
      <RouterProvider router={portfolioRouter} />
    </ThemeProvider>
  )
}
