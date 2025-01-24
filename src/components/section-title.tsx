import { Badge } from './ui/badge';

export interface SectionTitleProps {
  title?: string;
  shortDescription?: string;
  description?: string;
}

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Section Title',
  shortDescription: 'Short Description of Section',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
};

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title = defaultSectionTitleProps.title,
  shortDescription = defaultSectionTitleProps.shortDescription,
  description = defaultSectionTitleProps.description,
}) => {
  return (
    <div>
      <div className='flex items-center justify-center'>
        <Badge className='lg:text-base text-sm'>{title}</Badge>
      </div>
      <h4 className='lg:text-5xl text-3xl font-extrabold text-center my-2.5'>
        {shortDescription}
      </h4>
      <p className='text-center lg:text-lg font-medium text-slate-600 dark:text-slate-300'>
        {description}
      </p>
    </div>
  );
};
