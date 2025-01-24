import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  IconWorldWww,
  IconBrandGithub,
  IconDeviceMobile,
  IconDeviceLaptop,
} from '@tabler/icons-react';
import { Link } from 'react-router';
import { roleColors, typeProjectColors } from '@/lib/badge-color';

const stack = ['HTML', 'CSS', 'TypeScript', 'React', 'Vite', 'Tailwind CSS'];

interface IconWithTooltipProps {
  icon?: React.ReactNode;
  link: string;
  label?: string;
}

const IconWithTooltip: React.FC<IconWithTooltipProps> = ({
  icon,
  link,
  label,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Link
          to={link}
          target='_blank'
        >
          {icon}
        </Link>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

// interface ProjectCardProps {
//   title?: string;
//   link: string;
//   date?: string;
//   description?: string;
//   stack?: string[];
//   isBrowser?: boolean;
//   isGithub?: boolean;
//   browserLink?: string;
//   githubLink?: string;
//   companyName?: string;
//   projectType: 'Personal' | 'Freelance' | 'Company' | string;
//   projectRole?:
//     | 'Frontend'
//     | 'Backend'
//     | 'Fullstack'
//     | 'UI/UX'
//     | 'Database'
//     | 'DevOps'
//     | 'Security'
//     | 'Project Manager'
//     | 'System Analyst'
//     | 'Quality Assurance'
//     | string;
// }

export const ProjectCard = () => {
  const isBrowser = true;
  const isGithub = true;
  const isMobile = true;
  const isDekstop = true;

  return (
    <Card className='flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full'>
      <video
        src={'https://www.w3schools.com/html/mov_bbb.mp4'}
        autoPlay
        loop
        muted
        playsInline
        className='pointer-events-none mx-auto h-40 w-full object-cover object-top'
      />
      <CardHeader className='px-2 pt-3'>
        <div className='flex justify-between gap-8'>
          <CardTitle className='truncate'>
            Lorem Ipsum is simply dummy text of the printing and typesetting
          </CardTitle>
          <div className='flex justify-end gap-1'>
            {isBrowser && (
              <IconWithTooltip
                icon={<IconWorldWww size={16} />}
                link={''}
                label='Website'
              />
            )}
            {isDekstop && (
              <IconWithTooltip
                icon={<IconDeviceLaptop size={16} />}
                link={''}
                label='Desktop'
              />
            )}
            {isMobile && (
              <IconWithTooltip
                icon={<IconDeviceMobile size={16} />}
                link={''}
                label='Mobile'
              />
            )}
            {isGithub && (
              <IconWithTooltip
                icon={<IconBrandGithub size={16} />}
                link={''}
                label='Source'
              />
            )}
          </div>
        </div>
        <time className='font-sans text-xs italic'>June 2023 - Present</time>
        <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type
          and.Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
        </p>
      </CardHeader>
      <CardContent className='px-2 -mt-5'>
        <div className='mt-2 flex flex-wrap gap-1'>
          {stack.map((item) => (
            <Badge
              key={item}
              className='px-1 py-0 text-[11px]'
              variant='secondary'
            >
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className='px-3 pb-3 -mt-3'>
        <div className='w-full flex justify-between'>
          <div className='flex-none text-sm flex gap-1'>
            <Badge className={`${roleColors('Frontend')}`}>Database</Badge>
            <Badge className={`${typeProjectColors('Company')}`}>
              Delameta Bilano
            </Badge>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
