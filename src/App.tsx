import { ThemeProvider } from './stores/theme-provider';
import { RouterProvider } from 'react-router';
import { routes } from './routes';

function App() {
  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <RouterProvider router={routes} />
    </ThemeProvider>
  );
}

export default App;
