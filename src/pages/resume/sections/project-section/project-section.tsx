import { BlurFade } from '@/components/ui/blur-fade';
import { ProjectCard } from '@/components/project-card';
import { SectionTitle, SectionTitleProps } from '@/components/section-title';

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Project',
  shortDescription: 'Check out my latest work',
  description:
    "I've worked on a variety of projects, from simple websites to complex web applications. Here are a few of my works.",
};

export const ProjectSection = () => {
  return (
    <section
      id='project'
      className='mt-20 mb-8'
    >
      <BlurFade
        delay={0.3}
        inView
      >
        <SectionTitle {...defaultSectionTitleProps} />
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto mt-6'>
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
        </div>
      </BlurFade>
    </section>
  );
};
