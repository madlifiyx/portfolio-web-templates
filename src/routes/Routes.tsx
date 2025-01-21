import { createBrowserRouter } from 'react-router';

/**
 * Routes component to render routes
 * @returns {React.ReactNode} - Rendered routes
 */

export const routes = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <h1>Home</h1>
      </>
    ),
  },
]);
