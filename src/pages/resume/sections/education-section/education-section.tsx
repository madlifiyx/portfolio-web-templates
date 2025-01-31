import { BlurFade } from '@/components/ui/blur-fade';
import { ExperienceCard } from '@/components/experience-card';
import { educationExperience } from '@/data/data-experience';

export const EducationSection = () => {
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
        {educationExperience.map((experience, index) => (
          <ExperienceCard
            key={index}
            {...experience}
          />
        ))}
      </BlurFade>
    </section>
  );
};
