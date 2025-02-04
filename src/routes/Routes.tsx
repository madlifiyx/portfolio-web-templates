import { createBrowserRouter } from 'react-router';
import { RootLayout, ErrorLayout } from '@/layouts';
import { ProjectPage, ContactPage, ResumePage } from '@/pages';

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
        path: 'contact',
        element: <ContactPage />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorLayout />,
  },
]);
