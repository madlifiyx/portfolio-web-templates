import { createElement } from 'react'
import { createBrowserRouter } from 'react-router'
import { ContactPage } from './pages/contact-page'
import { ProjectPage } from './pages/project-page'
import { ResumePage } from './pages/resume-page'
import { RootLayout } from './root-layout'

export { ThemeProvider } from './theme-provider'

export const portfolioRouter = createBrowserRouter([
  {
    path: '/',
    element: createElement(RootLayout),
    children: [
      { index: true, element: createElement(ResumePage) },
      { path: 'project', element: createElement(ProjectPage) },
      { path: 'contact', element: createElement(ContactPage) },
    ],
  },
])
