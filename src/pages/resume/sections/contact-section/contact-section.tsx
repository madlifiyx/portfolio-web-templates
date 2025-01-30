import { BlurFade } from '@/components/ui/blur-fade';
import { SectionTitle, SectionTitleProps } from '@/components/section-title';
import { Link } from 'react-router';

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Contact',
  shortDescription: 'Get in Touch',
  description: (
    <p>
      I am always open to discussing new projects, opportunities, or just
      chatting about tech. You can reach me via{' '}
      <Link
        to='/contact'
        className='text-blue-400 hover:underline'
      >
        email
      </Link>{' '}
      or{' '}
      <Link
        to='/contact'
        className='text-blue-400 hover:underline'
      >
        phone
      </Link>
    </p>
  ),
};

export const ContactSection = () => {
  return (
    <section
      id='contact'
      className='my-12'
    >
      <BlurFade
        delay={0.3}
        inView
      >
        <SectionTitle {...defaultSectionTitleProps} />
      </BlurFade>
    </section>
  );
};
