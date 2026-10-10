import { createElement } from 'react'
import type { RouteObject } from 'react-router'
import { ContactsPage } from './contacts-page'
import { DashboardLayout } from './dashboard-layout'
import { ExperiencePage } from './experience-page'
import { LoginPage } from './login-page'
import { MediaPage } from './media-page'
import { OverviewPage } from './overview-page'
import { PreviewPage } from './preview-page'
import { ProfilePage } from './profile-page'
import { ProjectsPage } from './projects-page'
import { SkillsPage } from './skills-page'

export const dashboardRoutes: RouteObject[] = [
  { path: '/login', element: createElement(LoginPage) },
  {
    path: '/dashboard',
    element: createElement(DashboardLayout),
    children: [
      { index: true, element: createElement(OverviewPage) },
      { path: 'profile', element: createElement(ProfilePage) },
      { path: 'experience', element: createElement(ExperiencePage) },
      { path: 'skills', element: createElement(SkillsPage) },
      { path: 'projects', element: createElement(ProjectsPage) },
      { path: 'contacts', element: createElement(ContactsPage) },
      { path: 'media', element: createElement(MediaPage) },
      { path: 'preview', element: createElement(PreviewPage) },
    ],
  },
]
