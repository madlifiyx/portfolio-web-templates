import React from 'react';
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
import { useTheme } from '@/stores/theme-provider';
import { Link } from 'react-router';
import { roleColors, typeProjectColors } from '@/lib/badge-color';
import noImageLogo from '/images/no-project-image.png';
import { ProjectData } from '@/data/data-project';

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

export const ProjectCard: React.FC<ProjectData> = ({
  title,
  // projectVideo,
  projectImage,
  date,
  description,
  stack = [],
  isBrowser,
  isGithub,
  isMobile,
  isDekstop,
  browserLink,
  githubLink,
  mobileLink,
  dekstopLink,
  companyName,
  projectType,
  projectRole,
}) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = React.useState(0);
  const { theme } = useTheme();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <Card
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className='relative flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full'
    >
      <div
        className='pointer-events-none absolute -inset-px opacity-0 transition duration-300'
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${
            position.y
          }px, ${
            theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }, transparent 35%)`,
        }}
      />

      {/* {projectVideo && (
        <video
          src={projectVideo}
          autoPlay
          loop
          muted
          playsInline
          className='pointer-events-none mx-auto h-40 w-full object-cover object-top'
        />
      )} */}
      {projectImage && (
        <img
          src={projectImage}
          alt={title}
          className='pointer-events-none mx-auto h-40 w-full object-cover object-top border-b'
        />
      )}
      {!projectImage && (
        <img
          src={noImageLogo}
          alt={title}
          className='pointer-events-none mx-auto h-40 w-full object-cover object-top border-b'
        />
      )}
      <CardHeader className='px-2 pt-3'>
        <div className='flex justify-between gap-8'>
          <Link
            to={browserLink || ''}
            target='_blank'
          >
            <CardTitle className='truncate hover:underline cursor-pointer'>
              {title}
            </CardTitle>
          </Link>
          <div className='flex justify-end gap-1'>
            {isBrowser && (
              <IconWithTooltip
                icon={<IconWorldWww size={16} />}
                link={browserLink || ''}
                label='Website'
              />
            )}
            {isDekstop && (
              <IconWithTooltip
                icon={<IconDeviceLaptop size={16} />}
                link={dekstopLink || ''}
                label='Desktop'
              />
            )}
            {isMobile && (
              <IconWithTooltip
                icon={<IconDeviceMobile size={16} />}
                link={mobileLink || ''}
                label='Mobile'
              />
            )}
            {isGithub && (
              <IconWithTooltip
                icon={<IconBrandGithub size={16} />}
                link={githubLink || ''}
                label='Source'
              />
            )}
          </div>
        </div>
        <time className='font-sans text-xs italic'>{date}</time>
        <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          {description}
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
            <Badge className={`${roleColors('Frontend')}`}>{projectRole}</Badge>
            <Badge className={`${typeProjectColors(projectType)}`}>
              {projectType === 'Personal' ? projectType : companyName}
            </Badge>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
