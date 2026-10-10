import { createElement } from 'react'
import type { RouteObject } from 'react-router'
import { DashboardLayout } from './dashboard-layout'
import {
  ContactsPage,
  ExperiencePage,
  MediaPage,
  OverviewPage,
  PlatformsPage,
  PreviewPage,
  ProfilePage,
  ProjectsPage,
  SkillsPage,
} from './editor-pages'
import { LoginPage } from './login-page'

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
      { path: 'platforms', element: createElement(PlatformsPage) },
      { path: 'media', element: createElement(MediaPage) },
      { path: 'preview', element: createElement(PreviewPage) },
    ],
  },
]
