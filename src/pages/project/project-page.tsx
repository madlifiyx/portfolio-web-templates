import { BlurFade } from '@/components/ui/blur-fade';
import { SectionTitle, SectionTitleProps } from '@/components/section-title';

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Project',
  shortDescription: 'Check out my projects',
  description: (
    <p>
      I have worked on a number of projects, ranging from web development to
      machine learning. Here are some of my recent projects.
    </p>
  ),
};

export const ProjectPage = () => {
  return (
    <div
      aria-label='Project Page'
      id='project-page'
    >
      <BlurFade
        delay={0.2}
        inView
      >
        <SectionTitle {...defaultSectionTitleProps} />
      </BlurFade>
    </div>
  );
};
