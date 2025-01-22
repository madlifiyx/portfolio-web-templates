import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/layouts';
import { ProjectPage, BlogPage, ContactPage, ResumePage } from '@/pages';

/**
 * Routes component to render routes
 * @returns {React.ReactNode} - Rendered routes
 */

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ResumePage />,
      },
      {
        path: 'project',
        element: <ProjectPage />,
      },
      {
        path: 'blog',
        element: <BlogPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
    ],
  },
]);
