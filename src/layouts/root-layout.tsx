import { Navbar } from '@/components/navbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Outlet } from 'react-router';
import { ScrollProgress } from '@/components/ui/scroll-progress';

export const RootLayout = () => {
  return (
    <div className='min-h-screen bg-background font-sans antialiased max-w-2xl mx-auto py-12 sm:py-24 px-6'>
      <ScrollProgress className='bg-slate-400 dark:bg-slate-300' />
      <TooltipProvider delayDuration={0}>
        <Outlet />
        <Navbar />
      </TooltipProvider>
    </div>
  );
};
