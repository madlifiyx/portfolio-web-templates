import { createBrowserRouter, RouterProvider } from 'react-router'
import { dashboardRoutes } from './modules/dashboard'
import { portfolioRoutes, ThemeProvider } from './modules/portfolio'

const router = createBrowserRouter([...portfolioRoutes, ...dashboardRoutes])

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
