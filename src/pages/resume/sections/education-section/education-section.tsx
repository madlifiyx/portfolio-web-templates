import { useState, useEffect } from 'react';
import { BlurFade } from '@/components/ui/blur-fade';
import { ExperienceCard } from '@/components/experience-card';
import {
  ExperienceDataProps,
  getEducationExperience,
} from '@/data/data-experience';

export const EducationSection = () => {
  const [data, setData] = useState<ExperienceDataProps[] | null>(null);

  useEffect(() => {
    getEducationExperience().then(setData);
  }, []);

  return (
    <section
      id='education'
      className='mb-8'
    >
      <BlurFade
        delay={0.5}
        inView
      >
        <h2 className='text-xl font-bold mb-2'>Education</h2>
        {data?.map((experience, index) => (
          <ExperienceCard
            key={index}
            {...experience}
          />
        ))}
      </BlurFade>
    </section>
  );
};
