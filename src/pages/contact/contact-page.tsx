import { BlurFade } from '@/components/ui/blur-fade';
import { SectionTitle, SectionTitleProps } from '@/components/section-title';
import { ContactCard } from '@/components/contact-card';

import {
  IconBrandGithub,
  IconBrandYoutube,
  IconBrandX,
  IconBrandLinkedin,
} from '@tabler/icons-react';

const dataContact = [
  {
    title: 'Github',
    icon: <IconBrandGithub size={40} />,
    link: 'https://github.com/madlifiyx',
  },
  {
    title: 'Youtube',
    icon: <IconBrandYoutube size={40} />,
    link: 'https://youtube.com/madlifiyx',
  },
  {
    title: 'LinkedIn',
    icon: <IconBrandLinkedin size={40} />,
    link: 'https://linkedin.com/in/madlifiyx',
  },
  {
    title: 'X',
    icon: <IconBrandX size={34} />,
    link: 'https://x.com/madlifiyx',
  },
];

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Contact',
  shortDescription: 'Get in Touch',
  description: (
    <p>
      I am always open to discussing new projects, opportunities, or just
      chatting about tech
    </p>
  ),
};

export const ContactPage = () => {
  return (
    <div
      aria-label='Contact Page'
      id='contact-page'
    >
      <BlurFade
        delay={0.2}
        inView
      >
        <SectionTitle {...defaultSectionTitleProps} />
        <div className='flex justify-center my-10'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {dataContact.map((contact, index) => (
              <ContactCard
                key={index}
                {...contact}
              />
            ))}
          </div>
        </div>
      </BlurFade>
    </div>
  );
};
