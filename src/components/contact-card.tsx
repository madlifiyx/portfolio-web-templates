import { Link } from 'react-router';

interface ContactCardProps {
  title?: string;
  icon?: React.ReactNode;
  link: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  title,
  icon,
  link,
}) => {
  return (
    <Link
      to={link}
      target='_blank'
    >
      <div className='h-32 w-32 relative bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200'>
        <div className='flex flex-col items-center'>
          {icon}
          <h5 className='mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400'>
            {title}
          </h5>
        </div>
      </div>
    </Link>
  );
};
