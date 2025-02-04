import { useState, useEffect } from 'react';
import { BlurFade } from '@/components/ui/blur-fade';
import { SectionTitle, SectionTitleProps } from '@/components/section-title';
import { ContactCard } from '@/components/contact-card';
import { ContactData, getContactData } from '@/data/data-contact';

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
  const [dataContact, setDataContact] = useState<ContactData[]>([]);

  useEffect(() => {
    getContactData().then((data) => {
      if (data) {
        setDataContact(data);
      }
    });
  });

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
