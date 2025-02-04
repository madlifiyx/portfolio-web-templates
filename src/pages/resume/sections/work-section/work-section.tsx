import { useState, useEffect } from 'react';
import { BlurFade } from '@/components/ui/blur-fade';
import { ExperienceCard } from '@/components/experience-card';
import { getWorkExperience, ExperienceDataProps } from '@/data/data-experience';

export const WorkSection = () => {
  const [data, setData] = useState<ExperienceDataProps[] | null>(null);

  useEffect(() => {
    getWorkExperience().then(setData);
  }, []);

  return (
    <section
      id='work-experience'
      className='mb-8'
    >
      <BlurFade
        delay={0.5}
        inView
      >
        <h2 className='text-xl font-bold mb-2'>Work Experience</h2>
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
