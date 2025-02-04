import { useEffect, useState } from 'react';
import { BlurFade } from '@/components/ui/blur-fade';
import { SectionTitle, SectionTitleProps } from '@/components/section-title';
import { ProjectCard } from '@/components/project-card';
import { ProjectData, getProjectData } from '@/data/data-project';

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
  const [data, setData] = useState<ProjectData[] | null>(null);

  useEffect(() => {
    getProjectData().then(setData);
  }, []);

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

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto mt-6'>
          {data?.map((project, index) => (
            <ProjectCard
              key={index}
              {...project}
            />
          ))}
        </div>
      </BlurFade>
    </div>
  );
};
