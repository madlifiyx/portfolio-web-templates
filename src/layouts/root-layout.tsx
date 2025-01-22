import { Navbar } from '@/components/navbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Outlet } from 'react-router';

export const RootLayout = () => {
  return (
    <div className='min-h-screen bg-background font-sans antialiased max-w-2xl mx-auto py-12 sm:py-24 px-6'>
      <TooltipProvider delayDuration={0}>
        <Outlet />
        <Navbar />
      </TooltipProvider>
    </div>
  );
};
