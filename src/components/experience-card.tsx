import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IconChevronRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ExperienceCardProps {
  link?: string;
  logoImage?: string;
  place?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

const defaultCotentProps: ExperienceCardProps = {
  link: '#',
  logoImage: 'https://via.placeholder.com/150',
  place: 'World of Warcraft',
  position: 'Officer',
  startDate: 'May 2022',
  endDate: 'Jan 2023',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
};

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  link = defaultCotentProps.link,
  logoImage = defaultCotentProps.logoImage,
  place = defaultCotentProps.place,
  position = defaultCotentProps.position,
  startDate = defaultCotentProps.startDate,
  endDate = defaultCotentProps.endDate,
  description = defaultCotentProps.description,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      aria-label='Experience Card'
      className={`flex gap-2 justify-between group cursor-pointer my-2.5 rounded-xl w-full `}
      onClick={handleClick}
    >
      <div className='w-full flex gap-2'>
        <div className='flex-none'>
          <Avatar className='size-12 border'>
            <AvatarImage
              alt={place}
              src={logoImage}
            />
            <AvatarFallback>
              {'https://placehold.co/600x400?text=No Picture'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className='flex-grow'>
          <div className='flex items-center justify-between gap-1.5'>
            <div className='flex items-center gap-1'>
              <a
                href={link}
                target='_blank'
                rel='noopener noreferrer'
                className='font-semibold hover:underline text-sm'
              >
                {place}
              </a>
              <IconChevronRight
                size={16}
                className={cn(
                  'translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100',
                  isExpanded ? 'rotate-90' : 'rotate-0'
                )}
              />
            </div>
            <h5 className='text-xs lg:text-sm hidden lg:block text-slate-600 dark:text-slate-300'>
              {startDate} - {endDate}
            </h5>
          </div>
          <h4 className='text-xs font-medium text-slate-600 dark:text-slate-300 italic'>
            {position}
          </h4>
          <h5 className='text-xs lg:text-sm lg:hidden text-slate-600 dark:text-slate-300'>
            {startDate} - {endDate}
          </h5>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className='text-sm text-justify mt-2.5 font-semibold text-slate-600 dark:text-slate-300'>
                {description}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
