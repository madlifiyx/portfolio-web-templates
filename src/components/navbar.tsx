import { Dock, DockIcon } from './ui/dock';
import { Separator } from './ui/separator';
import { ThemeToogle } from './theme-toogle';
import {
  IconUserCheck,
  IconDownload,
  IconChecklist,
  IconAddressBook,
} from '@tabler/icons-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NavLink } from 'react-router';
import resume from '@/assets/pdf/Resume.pdf';

const navItems = [
  { to: '/', icon: <IconUserCheck />, label: 'Resume' },
  { to: '/project', icon: <IconChecklist />, label: 'Project' },
  { to: '/contact', icon: <IconAddressBook />, label: 'Contact' },
];

export const Navbar = () => {
  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-6 lg:bottom-10 z-30 mx-auto mb-4 flex origin-bottom h-full max-h-14'>
      <div className='fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background' />
      <Dock className='z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-4 lg:px-2 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]'>
        {navItems.map(({ to, icon, label }) => (
          <DockIcon
            key={to}
            className='mx-1 lg:mx-0'
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `text-xs mt-0.5 ${isActive ? 'text-emerald-600' : ''}`
                    }
                  >
                    <div className='flex items-center justify-center'>
                      {icon}
                    </div>
                    <div className='text-center lg:hidden text-xs'>{label}</div>
                  </NavLink>
                </div>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </DockIcon>
        ))}
        <DockIcon className='mx-1 lg:mx-0'>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={resume}
                download='Resume - Your Name.pdf'
                className='flex flex-col items-center justify-center'
              >
                <IconDownload />
                <div className='text-center lg:hidden text-xs'>Download</div>
              </a>
            </TooltipTrigger>
            <TooltipContent>Download Resume</TooltipContent>
          </Tooltip>
        </DockIcon>
        <Separator orientation='vertical' />
        <DockIcon>
          <ThemeToogle />
        </DockIcon>
      </Dock>
    </div>
  );
};
