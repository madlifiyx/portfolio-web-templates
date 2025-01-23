import { BlurFade } from '@/components/ui/blur-fade';
import { ExperienceCard } from '@/components/experience-card';

export const EducationSection = () => {
  return (
    <section
      id='work-experience'
      className='mb-8'
    >
      <BlurFade
        delay={0.5}
        inView
      >
        <h2 className='text-xl font-bold mb-2'>Education</h2>
        <ExperienceCard />
        <ExperienceCard />
        <ExperienceCard />
      </BlurFade>
    </section>
  );
};
